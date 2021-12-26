import { Moderation, type BushButtonInteraction, type BushMessage } from '#lib';
import { GuildMember, MessageActionRow, MessageButton, MessageEmbed, type TextChannel } from 'discord.js';
import badLinksSecretArray from '../badlinks-secret.js'; // I cannot make this public so just make a new file that export defaults an empty array
import badLinksArray from '../badlinks.js';
import badWords from '../badwords.js';

/**
 * Handles auto moderation functionality.
 */
export class AutoMod {
	/**
	 * The message to check for blacklisted phrases on
	 */
	private message: BushMessage;

	/**
	 * Whether or not a punishment has already been given to the user
	 */
	private punished = false;

	/**
	 * @param message The message to check and potentially perform automod actions to
	 */
	public constructor(message: BushMessage) {
		this.message = message;
		if (message.author.id === client.user?.id) return;
		void this.handle();
	}

	/**
	 * Handles the auto moderation
	 */
	private async handle() {
		if (this.message.channel.type === 'DM' || !this.message.guild) return;
		if (!(await this.message.guild.hasFeature('automod'))) return;

		const customAutomodPhrases = (await this.message.guild.getSetting('autoModPhases')) ?? {};
		const badLinks: BadWords = {};

		const uniqueLinks = [...new Set([...badLinksArray, ...badLinksSecretArray])];

		uniqueLinks.forEach((link) => {
			badLinks[link] = {
				severity: Severity.PERM_MUTE,
				ignoreSpaces: true,
				ignoreCapitalization: true,
				reason: 'malicious link',
				regex: false
			};
		});

		const result = {
			...this.checkWords(customAutomodPhrases),
			...this.checkWords((await this.message.guild.hasFeature('excludeDefaultAutomod')) ? {} : badWords),
			...this.checkWords((await this.message.guild.hasFeature('excludeAutomodScamLinks')) ? {} : badLinks)
		};

		if (Object.keys(result).length === 0) return;

		const highestOffence = Object.entries(result)
			.map(([key, value]) => ({ word: key, ...value }))
			.sort((a, b) => b.severity - a.severity)[0];

		if (highestOffence.severity === undefined || highestOffence.severity === null) {
			void this.message.guild.sendLogChannel('error', {
				embeds: [
					{
						title: 'AutoMod Error',
						description: `Unable to find severity information for ${util.format.inlineCode(highestOffence.word)}`,
						color: util.colors.error
					}
				]
			});
		} else {
			const color = this.punish(highestOffence);
			void this.log(highestOffence, color, result);
		}

		if (!this.punished && (await this.message.guild.hasFeature('delScamMentions'))) void this.checkScamMentions();
	}

	/**
	 * Checks if any of the words provided are in the message
	 * @param words The words to check for
	 * @returns The blacklisted words found in the message
	 */
	private checkWords(words: BadWords): BadWords {
		if (Object.keys(words).length === 0) return {};

		const matchedWords: BadWords = {};
		for (const word in words) {
			const wordOptions = words[word];
			if (wordOptions.regex) {
				if (new RegExp(word).test(this.format(word, wordOptions))) {
					matchedWords[word] = wordOptions;
				}
			} else {
				if (this.format(this.message.content, wordOptions).includes(this.format(word, wordOptions))) {
					matchedWords[word] = wordOptions;
				}
			}
		}
		return matchedWords;
	}

	/**
	 * If the message contains '@everyone' or '@here' and it contains a common scam phrase, it will be deleted
	 * @returns
	 */
	private async checkScamMentions() {
		const includes = this.message.content.toLocaleLowerCase().includes;
		if (!includes('@everyone' || !includes('@here'))) return;
		// It would be bad if we deleted a message that actually pinged @everyone or @here
		if (this.message.member?.permissionsIn(this.message.channelId).has('MENTION_EVERYONE') || this.message.mentions.everyone)
			return;

		if (
			includes('steam') ||
			includes('www.youtube.com') ||
			includes('youtu.be') ||
			includes('nitro') ||
			includes('1 month') ||
			includes('3 months') ||
			includes('personalize your profile') ||
			includes('even more') ||
			includes('xbox and discord') ||
			includes('left over') ||
			includes('check this lol') ||
			includes('airdrop')
		) {
			const color = this.punish({ severity: Severity.TEMP_MUTE, reason: 'everyone mention and scam phrase' } as HighestOffence);
			void this.message.guild!.sendLogChannel('automod', {
				embeds: [
					new MessageEmbed()
						.setTitle(`[Severity ${Severity.TEMP_MUTE}] Mention Scam Deleted`)
						.setDescription(
							`**User:** ${this.message.author} (${this.message.author.tag})\n**Sent From**: <#${this.message.channel.id}> [Jump to context](${this.message.url})`
						)
						.addField('Message Content', `${await util.codeblock(this.message.content, 1024)}`)
						.setColor(color)
						.setTimestamp()
				],
				components:
					Severity.TEMP_MUTE >= 2
						? [
								new MessageActionRow().addComponents(
									new MessageButton()
										.setStyle('DANGER')
										.setLabel('Ban User')
										.setCustomId(`automod;ban;${this.message.author.id};everyone mention and scam phrase`)
								)
						  ]
						: undefined
			});
		}
	}

	/**
	 * Format a string according to the word options
	 * @param string The string to format
	 * @param wordOptions The word options to format with
	 * @returns The formatted string
	 */
	private format(string: string, wordOptions: BadWordDetails) {
		const temp = wordOptions.ignoreCapitalization ? string.toLowerCase() : string;
		return wordOptions.ignoreSpaces ? temp.replace(/ /g, '') : temp;
	}

	/**
	 * Punishes the user based on the severity of the offence
	 * @param highestOffence The highest offence to punish the user for
	 * @returns The color of the embed that the log should, based on the severity of the offence
	 */
	private punish(highestOffence: HighestOffence) {
		let color;
		switch (highestOffence.severity) {
			case Severity.DELETE: {
				color = util.colors.lightGray;
				void this.message.delete().catch((e) => deleteError.bind(this, e));
				this.punished = true;
				break;
			}
			case Severity.WARN: {
				color = util.colors.yellow;
				void this.message.delete().catch((e) => deleteError.bind(this, e));
				void this.message.member?.warn({
					moderator: this.message.guild!.me!,
					reason: `[AutoMod] ${highestOffence.reason}`
				});
				this.punished = true;
				break;
			}
			case Severity.TEMP_MUTE: {
				color = util.colors.orange;
				void this.message.delete().catch((e) => deleteError.bind(this, e));
				void this.message.member?.mute({
					moderator: this.message.guild!.me!,
					reason: `[AutoMod] ${highestOffence.reason}`,
					duration: 900_000 // 15 minutes
				});
				this.punished = true;
				break;
			}
			case Severity.PERM_MUTE: {
				color = util.colors.red;
				void this.message.delete().catch((e) => deleteError.bind(this, e));
				void this.message.member?.mute({
					moderator: this.message.guild!.me!,
					reason: `[AutoMod] ${highestOffence.reason}`,
					duration: 0 // permanent
				});
				this.punished = true;
				break;
			}
			default: {
				throw new Error(`Invalid severity: ${highestOffence.severity}`);
			}
		}

		return color;

		async function deleteError(this: AutoMod, e: Error | any) {
			void this.message.guild?.sendLogChannel('error', {
				embeds: [
					{
						title: 'AutoMod Error',
						description: `Unable to delete triggered message.`,
						fields: [{ name: 'Error', value: await util.codeblock(`${e.stack ?? e}`, 1024, 'js', true) }],
						color: util.colors.error
					}
				]
			});
		}
	}

	/**
	 * Log an automod infraction to the guild's specified automod log channel
	 * @param highestOffence The highest severity word found in the message
	 * @param color The color that the log embed should be (based on the severity)
	 * @param offences The other offences that were also matched in the message
	 */
	private async log(highestOffence: HighestOffence, color: `#${string}`, offences: BadWords) {
		void client.console.info(
			'autoMod',
			`Severity <<${highestOffence.severity}>> action performed on <<${this.message.author.tag}>> (<<${
				this.message.author.id
			}>>) in <<#${(this.message.channel as TextChannel).name}>> in <<${this.message.guild!.name}>>`
		);

		await this.message.guild!.sendLogChannel('automod', {
			embeds: [
				new MessageEmbed()
					.setTitle(`[Severity ${highestOffence.severity}] Automod Action Performed`)
					.setDescription(
						`**User:** ${this.message.author} (${this.message.author.tag})\n**Sent From**: <#${
							this.message.channel.id
						}> [Jump to context](${this.message.url})\n**Blacklisted Words:** ${Object.keys(offences)
							.map((key) => `\`${key}\``)
							.join(', ')}`
					)
					.addField('Message Content', `${await util.codeblock(this.message.content, 1024)}`)
					.setColor(color)
					.setTimestamp()
					.setAuthor({ name: this.message.author.tag, url: this.message.author.displayAvatarURL() })
			],
			components:
				highestOffence.severity >= 2
					? [
							new MessageActionRow().addComponents(
								new MessageButton()
									.setStyle('DANGER')
									.setLabel('Ban User')
									.setCustomId(`automod;ban;${this.message.author.id};${highestOffence.reason}`)
							)
					  ]
					: undefined
		});
	}

	/**
	 * Handles the ban button in the automod log.
	 * @param interaction The button interaction.
	 */
	public static async handleInteraction(interaction: BushButtonInteraction) {
		if (!interaction.memberPermissions?.has('BAN_MEMBERS'))
			return interaction.reply({
				content: `${util.emojis.error} You are missing the **Ban Members** permission.`,
				ephemeral: true
			});
		const [action, userId, reason] = interaction.customId.replace('automod;', '').split(';');
		switch (action) {
			case 'ban': {
				const victim = await interaction.guild!.members.fetch(userId).catch(() => null);
				const moderator =
					interaction.member instanceof GuildMember
						? interaction.member
						: await interaction.guild!.members.fetch(interaction.user.id);

				const check = victim ? await Moderation.permissionCheck(moderator, victim, 'ban', true) : true;

				if (check !== true)
					return interaction.reply({
						content: check,
						ephemeral: true
					});

				const result = await interaction.guild?.bushBan({
					user: userId,
					reason,
					moderator: interaction.user.id,
					evidence: (interaction.message as BushMessage).url ?? undefined
				});

				if (result === 'success')
					return interaction.reply({
						content: `${util.emojis.success} Successfully banned **${
							interaction.guild?.members.cache.get(userId)?.user.tag ?? userId
						}**.`,
						ephemeral: true
					});
				else
					return interaction.reply({
						content: `${util.emojis.error} Could not ban **${
							interaction.guild?.members.cache.get(userId)?.user.tag ?? userId
						}**: \`${result}\` .`,
						ephemeral: true
					});
			}
		}
	}
}

/**
 * The severity of the blacklisted word
 */
export const enum Severity {
	/**
	 * Delete message
	 */
	DELETE,

	/**
	 * Delete message and warn user
	 */
	WARN,

	/**
	 * Delete message and mute user for 15 minutes
	 */
	TEMP_MUTE,

	/**
	 * Delete message and mute user permanently
	 */
	PERM_MUTE
}

/**
 * Details about a blacklisted word
 */
interface BadWordDetails {
	/**
	 * The severity of the word
	 */
	severity: Severity;

	/**
	 * Whether or not to ignore spaces when checking for the word
	 */
	ignoreSpaces: boolean;

	/**
	 * Whether or not to ignore case when checking for the word
	 */
	ignoreCapitalization: boolean;

	/**
	 * The reason that this word is blacklisted (used for the punishment reason)
	 */
	reason: string;

	/**
	 * Whether or not the word is regex
	 */
	regex: boolean;
}

interface HighestOffence extends BadWordDetails {
	/**
	 * The word that is blacklisted
	 */
	word: string;
}

/**
 * Blacklisted words mapped to their details
 */
export interface BadWords {
	/**
	 * The blacklisted word
	 */
	[key: string]: BadWordDetails;
}
