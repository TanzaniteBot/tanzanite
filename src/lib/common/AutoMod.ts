import { banResponse, Moderation, type BushButtonInteraction, type BushMessage } from '#lib';
import assert from 'assert';
import chalk from 'chalk';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	GuildMember,
	PermissionFlagsBits,
	type TextChannel
} from 'discord.js';

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

	private get isImmune() {
		if (!this.message.inGuild()) return false;
		assert(this.message.member);

		if (this.message.author.isOwner()) return true;
		if (this.message.guild.ownerId === this.message.author.id) return true;
		if (this.message.member.permissions.has('Administrator')) return true;

		return false;
	}

	/**
	 * Handles the auto moderation
	 */
	private async handle() {
		if (!this.message.inGuild()) return;
		if (!(await this.message.guild.hasFeature('automod'))) return;
		if (this.message.author.bot) return;

		traditional: {
			if (this.isImmune) break traditional;
			const badLinksArray = util.getShared('badLinks');
			const badLinksSecretArray = util.getShared('badLinksSecret');
			const badWordsRaw = util.getShared('badWords');

			const customAutomodPhrases = (await this.message.guild.getSetting('autoModPhases')) ?? [];
			const uniqueLinks = [...new Set([...badLinksArray, ...badLinksSecretArray])];

			const badLinks: BadWordDetails[] = uniqueLinks.map((link) => ({
				match: link,
				severity: Severity.PERM_MUTE,
				ignoreSpaces: false,
				ignoreCapitalization: true,
				reason: 'malicious link',
				regex: false
			}));

			const parsedBadWords = Object.values(badWordsRaw).flat();

			const result = [
				...this.checkWords(customAutomodPhrases),
				...this.checkWords((await this.message.guild.hasFeature('excludeDefaultAutomod')) ? [] : parsedBadWords),
				...this.checkWords((await this.message.guild.hasFeature('excludeAutomodScamLinks')) ? [] : badLinks)
			];

			if (result.length === 0) break traditional;

			const highestOffence = result.sort((a, b) => b.severity - a.severity)[0];

			if (highestOffence.severity === undefined || highestOffence.severity === null) {
				void this.message.guild.sendLogChannel('error', {
					embeds: [
						{
							title: 'AutoMod Error',
							description: `Unable to find severity information for ${util.format.inlineCode(highestOffence.match)}`,
							color: util.colors.error
						}
					]
				});
			} else {
				const color = this.punish(highestOffence);
				void this.log(highestOffence, color, result);
			}
		}

		other: {
			if (this.isImmune) break other;
			if (!this.punished && (await this.message.guild.hasFeature('delScamMentions'))) void this.checkScamMentions();
		}

		if (!this.punished && (await this.message.guild.hasFeature('perspectiveApi'))) void this.checkPerspectiveApi();
	}

	/**
	 * Checks if any of the words provided are in the message
	 * @param words The words to check for
	 * @returns The blacklisted words found in the message
	 */
	private checkWords(words: BadWordDetails[]): BadWordDetails[] {
		if (words.length === 0) return [];

		const matchedWords: BadWordDetails[] = [];
		for (const word of words) {
			if (word.regex) {
				if (new RegExp(word.match).test(this.format(word.match, word))) {
					matchedWords.push(word);
				}
			} else {
				if (this.format(this.message.content, word).includes(this.format(word.match, word))) {
					matchedWords.push(word);
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
		const includes = (c: string) => this.message.content.toLocaleLowerCase().includes(c);
		if (!includes('@everyone') && !includes('@here')) return;
		// It would be bad if we deleted a message that actually pinged @everyone or @here
		if (
			this.message.member?.permissionsIn(this.message.channelId).has(PermissionFlagsBits.MentionEveryone) ||
			this.message.mentions.everyone
		)
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
			const color = this.punish({ severity: Severity.TEMP_MUTE, reason: 'everyone mention and scam phrase' } as BadWordDetails);
			void this.message.guild!.sendLogChannel('automod', {
				embeds: [
					new EmbedBuilder()
						.setTitle(`[Severity ${Severity.TEMP_MUTE}] Mention Scam Deleted`)
						.setDescription(
							`**User:** ${this.message.author} (${this.message.author.tag})\n**Sent From:** <#${this.message.channel.id}> [Jump to context](${this.message.url})`
						)
						.addFields([{ name: 'Message Content', value: `${await util.codeblock(this.message.content, 1024)}` }])
						.setColor(color)
						.setTimestamp()
				],
				components: [
					new ActionRowBuilder<ButtonBuilder>().addComponents([
						new ButtonBuilder({
							style: ButtonStyle.Danger,
							label: 'Ban User',
							customId: `automod;ban;${this.message.author.id};everyone mention and scam phrase`
						})
					])
				]
			});
		}
	}

	private async checkPerspectiveApi() {
		return;
		if (!client.config.isDevelopment) return;

		if (!this.message.content) return;
		client.perspective.comments.analyze(
			{
				key: client.config.credentials.perspectiveApiKey,
				resource: {
					comment: {
						text: this.message.content
					},
					requestedAttributes: {
						TOXICITY: {},
						SEVERE_TOXICITY: {},
						IDENTITY_ATTACK: {},
						INSULT: {},
						PROFANITY: {},
						THREAT: {},
						SEXUALLY_EXPLICIT: {},
						FLIRTATION: {}
					}
				}
			},
			(err: any, response: any) => {
				if (err) return console.log(err?.message);

				const normalize = (val: number, min: number, max: number) => (val - min) / (max - min);

				const color = (val: number) => {
					if (val >= 0.5) {
						const x = 194 - Math.round(normalize(val, 0.5, 1) * 194);
						return chalk.rgb(194, x, 0)(val);
					} else {
						const x = Math.round(normalize(val, 0, 0.5) * 194);
						return chalk.rgb(x, 194, 0)(val);
					}
				};

				console.log(chalk.cyan(this.message.content));
				Object.entries(response.data.attributeScores)
					.sort(([a], [b]) => a.localeCompare(b))
					.forEach(([key, value]: any[]) => console.log(chalk.white(key), color(value.summaryScore.value)));
			}
		);
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
	private punish(highestOffence: BadWordDetails) {
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
				void this.message.member?.bushWarn({
					moderator: this.message.guild!.members.me!,
					reason: `[AutoMod] ${highestOffence.reason}`
				});
				this.punished = true;
				break;
			}
			case Severity.TEMP_MUTE: {
				color = util.colors.orange;
				void this.message.delete().catch((e) => deleteError.bind(this, e));
				void this.message.member?.bushMute({
					moderator: this.message.guild!.members.me!,
					reason: `[AutoMod] ${highestOffence.reason}`,
					duration: 900_000 // 15 minutes
				});
				this.punished = true;
				break;
			}
			case Severity.PERM_MUTE: {
				color = util.colors.red;
				void this.message.delete().catch((e) => deleteError.bind(this, e));
				void this.message.member?.bushMute({
					moderator: this.message.guild!.members.me!,
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
						fields: [{ name: 'Error', value: await util.codeblock(`${util.formatError(e)}`, 1024, 'js', true) }],
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
	private async log(highestOffence: BadWordDetails, color: number, offences: BadWordDetails[]) {
		void client.console.info(
			'autoMod',
			`Severity <<${highestOffence.severity}>> action performed on <<${this.message.author.tag}>> (<<${
				this.message.author.id
			}>>) in <<#${(this.message.channel as TextChannel).name}>> in <<${this.message.guild!.name}>>`
		);

		await this.message.guild!.sendLogChannel('automod', {
			embeds: [
				new EmbedBuilder()
					.setTitle(`[Severity ${highestOffence.severity}] Automod Action Performed`)
					.setDescription(
						`**User:** ${this.message.author} (${this.message.author.tag})\n**Sent From:** <#${
							this.message.channel.id
						}> [Jump to context](${this.message.url})\n**Blacklisted Words:** ${offences.map((o) => `\`${o.match}\``).join(', ')}`
					)
					.addFields([{ name: 'Message Content', value: `${await util.codeblock(this.message.content, 1024)}` }])
					.setColor(color)
					.setTimestamp()
					.setAuthor({ name: this.message.author.tag, url: this.message.author.displayAvatarURL() })
			],
			components:
				highestOffence.severity >= 2
					? [
							new ActionRowBuilder<ButtonBuilder>().addComponents([
								new ButtonBuilder({
									style: ButtonStyle.Danger,
									label: 'Ban User',
									customId: `automod;ban;${this.message.author.id};${highestOffence.reason}`
								})
							])
					  ]
					: undefined
		});
	}

	/**
	 * Handles the ban button in the automod log.
	 * @param interaction The button interaction.
	 */
	public static async handleInteraction(interaction: BushButtonInteraction) {
		if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers))
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

				const victimUserFormatted = (await util.resolveNonCachedUser(userId))?.tag ?? userId;
				if (result === banResponse.SUCCESS)
					return interaction.reply({
						content: `${util.emojis.success} Successfully banned **${victimUserFormatted}**.`,
						ephemeral: true
					});
				else if (result === banResponse.DM_ERROR)
					return interaction.reply({
						content: `${util.emojis.warn} Banned ${victimUserFormatted} however I could not send them a dm.`,
						ephemeral: true
					});
				else
					return interaction.reply({
						content: `${util.emojis.error} Could not ban **${victimUserFormatted}**: \`${result}\` .`,
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
export interface BadWordDetails {
	/**
	 * The word that is blacklisted
	 */
	match: string;

	/**
	 * The severity of the word
	 */
	severity: Severity | 1 | 2 | 3;

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

/**
 * Blacklisted words mapped to their details
 */
export interface BadWords {
	[category: string]: BadWordDetails[];
}
