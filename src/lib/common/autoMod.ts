import { Formatters, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from 'discord.js';
import badLinksArray from '../../lib/badlinks';
import badLinksSecretArray from '../../lib/badlinks-secret'; // I cannot make this public so just make a new file that export defaults an empty array
import badWords from '../../lib/badwords';
import { BushButtonInteraction } from '../extensions/discord.js/BushButtonInteraction';
import { BushGuildMember } from '../extensions/discord.js/BushGuildMember';
import { BushMessage } from '../extensions/discord.js/BushMessage';
import { Moderation } from './moderation';

export class AutoMod {
	private message: BushMessage;

	public constructor(message: BushMessage) {
		this.message = message;
		void this.handle();
	}

	private async handle(): Promise<void> {
		if (this.message.channel.type === 'DM' || !this.message.guild) return;
		if (!(await this.message.guild.hasFeature('automod'))) return;

		const customAutomodPhrases = (await this.message.guild.getSetting('autoModPhases')) ?? {};
		const badLinks: BadWords = {};
		const badLinksSecret: BadWords = {};

		badLinksArray.forEach((link) => {
			badLinks[link] = {
				severity: Severity.PERM_MUTE,
				ignoreSpaces: true,
				ignoreCapitalization: true,
				reason: 'malicious link'
			};
		});
		badLinksSecretArray.forEach((link) => {
			badLinks[link] = {
				severity: Severity.PERM_MUTE,
				ignoreSpaces: true,
				ignoreCapitalization: true,
				reason: 'malicious link'
			};
		});

		const result = {
			...this.checkWords(customAutomodPhrases),
			...this.checkWords((await this.message.guild.hasFeature('excludeDefaultAutomod')) ? {} : badWords),
			...this.checkWords(
				(await this.message.guild.hasFeature('excludeAutomodScamLinks')) ? {} : { ...badLinks, ...badLinksSecret }
			)
		};

		if (Object.keys(result).length === 0) return;

		const highestOffence = Object.entries(result)
			.map(([key, value]) => ({ word: key, ...value }))
			.sort((a, b) => b.severity - a.severity)[0];

		if (highestOffence.severity === undefined || highestOffence.severity === null)
			void this.message.guild.sendLogChannel('error', {
				embeds: [
					{
						title: 'AutoMod Error',
						description: `Unable to find severity information for ${Formatters.inlineCode(
							util.discord.escapeInlineCode(highestOffence.word)
						)}`,
						color: util.colors.error
					}
				]
			});
		else {
			const color = this.punish(highestOffence);
			void this.log(highestOffence, color, result);
		}
	}

	private checkWords(words: BadWords): BadWords {
		if (Object.keys(words).length === 0) return {};

		const matchedWords: BadWords = {};
		for (const word in words) {
			const wordOptions = words[word];
			if (this.format(this.message.content, wordOptions) === this.format(word, wordOptions)) {
			}
		}
		return matchedWords;
	}

	private format(string: string, wordOptions: BadWordDetails) {
		const temp = wordOptions.ignoreCapitalization ? string.toLowerCase() : string;
		return wordOptions.ignoreSpaces ? temp.replace(/ /g, '') : temp;
	}

	private punish(highestOffence: BadWordDetails & { word: string }) {
		let color;
		switch (highestOffence.severity) {
			case Severity.DELETE: {
				color = util.colors.lightGray;
				void this.message.delete().catch((e) => deleteError.bind(this, e));
				break;
			}
			case Severity.WARN: {
				color = util.colors.yellow;
				void this.message.delete().catch((e) => deleteError.bind(this, e));
				void this.message.member?.warn({
					moderator: this.message.guild!.me!,
					reason: `[AutoMod] ${highestOffence.reason}`
				});
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
				break;
			}
			case Severity.PERM_MUTE: {
				color = util.colors.red;
				void this.message.delete().catch((e) => deleteError.bind(this, e));
				void this.message.member?.mute({
					moderator: this.message.guild!.me!,
					reason: `[AutoMod] ${highestOffence.reason}`,
					duration: 900_000 // 15 minutes
				});
				break;
			}
			default: {
				throw new Error('Invalid severity');
			}
		}

		return color;

		async function deleteError(this: AutoMod, e: Error | any) {
			this.message.guild?.sendLogChannel('error', {
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

	private async log(highestOffence: BadWordDetails & { word: string }, color: `#${string}`, offences: BadWords) {
		void client.console.info(
			'autoMod',
			`Severity <<${highestOffence.severity}>> action performed on <<${this.message.author.tag}>> (<<${
				this.message.author.id
			}>>) in <<#${(this.message.channel as TextChannel).name}>> in <<${this.message.guild!.name}>>`
		);

		return await this.message.guild!.sendLogChannel('automod', {
			embeds: [
				new MessageEmbed()
					.setTitle(`[Severity ${highestOffence.severity}] Automod Action Performed`)
					.setDescription(
						`**User:** ${this.message.author} (${this.message.author.tag})\n**Sent From**: <#${
							this.message.channel.id
						}> [Jump to context](${this.message.url})\n**Blacklisted Words:** ${util
							.surroundArray(Object.keys(offences), '`')
							.join(', ')}`
					)
					.addField('Message Content', `${await util.codeblock(this.message.content, 1024)}`)
					.setColor(color)
					.setTimestamp()
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

	public static async handleInteraction(interaction: BushButtonInteraction) {
		if (!interaction.memberPermissions?.has('BAN_MEMBERS'))
			return interaction.reply({
				content: `${util.emojis.error} You are missing the **Ban Members** permission.`,
				ephemeral: true
			});
		const [action, userId, reason] = interaction.customId.replace('automod;', '').split(';');
		switch (action) {
			case 'ban': {
				await interaction.deferReply();
				const check = await Moderation.permissionCheck(
					interaction.member as BushGuildMember,
					interaction.guild!.members.cache.get(userId)!,
					'ban',
					true
				);

				if (check !== true)
					return interaction.reply({
						content: check,
						ephemeral: true
					});

				const result = await interaction.guild?.bushBan({ user: userId, reason, moderator: interaction.user.id });

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

export const enum Severity {
	/** Delete message */
	DELETE,
	/** Delete message and warn user */
	WARN,
	/** Delete message and mute user for 15 minutes */
	TEMP_MUTE,
	/** Delete message and mute user permanently */
	PERM_MUTE
}

interface BadWordDetails {
	severity: Severity;
	ignoreSpaces: boolean;
	ignoreCapitalization: boolean;
	reason: string;
}

export interface BadWords {
	[key: string]: BadWordDetails;
}
