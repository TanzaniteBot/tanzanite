import { colors } from '#lib/utils/Constants.js';
import { format, formatError } from '#lib/utils/Utils.js';
import { stripIndent } from '#tags';
import chalk from 'chalk';
import { EmbedBuilder, PermissionFlagsBits, type GuildTextBasedChannel, type Message } from 'discord.js';
import assert from 'node:assert/strict';
import { Automod, Severity, type BadWordDetails } from './AutomodShared.js';

/**
 * Handles message auto moderation functionality.
 */
export class MessageAutomod extends Automod {
	/**
	 * @param message The message to check and potentially perform automod actions on
	 */
	public constructor(private readonly message: Message) {
		assert(message.member);
		super(message.member);

		if (message.author.id === message.client.user?.id) return;

		void this.handle();
	}

	/**
	 * Handles the auto moderation
	 */
	protected async handle() {
		if (!this.message.inGuild()) return;
		if (!(await this.guild.hasFeature('automod'))) return;
		if (this.user.bot) return;
		if (!this.message.member) return;

		traditional: {
			if (this.isImmune) break traditional;
			const badLinksArray = this.client.utils.getShared('badLinks');
			const badLinksSecretArray = this.client.utils.getShared('badLinksSecret');
			const badWordsRaw = this.client.utils.getShared('badWords');

			const customAutomodPhrases = (await this.guild.getSetting('autoModPhases')) ?? [];
			const uniqueLinks = [...new Set([...badLinksArray, ...badLinksSecretArray])];

			const badLinks: BadWordDetails[] = uniqueLinks.map((link) => ({
				match: link,
				severity: Severity.PERM_MUTE,
				ignoreSpaces: false,
				ignoreCapitalization: true,
				reason: 'malicious link',
				regex: false,
				userInfo: false
			}));

			const parsedBadWords = Object.values(badWordsRaw).flat();

			const result = this.checkWords(
				[
					...customAutomodPhrases,
					...((await this.guild.hasFeature('excludeDefaultAutomod')) ? [] : parsedBadWords),
					...((await this.guild.hasFeature('excludeAutomodScamLinks')) ? [] : badLinks)
				],
				this.message.content
			);

			if (result.length === 0) break traditional;

			const highestOffense = result.sort((a, b) => b.severity - a.severity)[0];

			if (highestOffense.severity === undefined || highestOffense.severity === null) {
				void this.guild.sendLogChannel('error', {
					embeds: [
						{
							title: 'AutoMod Error',
							description: `Unable to find severity information for ${format.inlineCode(highestOffense.match)}`,
							color: colors.error
						}
					]
				});
			} else {
				this.punish(highestOffense);
				void this.logMessage(highestOffense, result);
			}
		}

		other: {
			if (this.isImmune) break other;
			if (!this.punished && (await this.guild.hasFeature('delScamMentions'))) void this.checkScamMentions();
		}

		if (!this.punished && (await this.guild.hasFeature('perspectiveApi'))) void this.checkPerspectiveApi();
	}

	/**
	 * If the message contains '@everyone' or '@here' and it contains a common scam phrase, it will be deleted
	 * @returns
	 */
	protected async checkScamMentions() {
		const includes = (c: string) => this.message.content.toLocaleLowerCase().includes(c);
		if (!includes('@everyone') && !includes('@here')) return;

		// It would be bad if we deleted a message that actually pinged @everyone or @here
		if (
			this.member.permissionsIn(this.message.channelId).has(PermissionFlagsBits.MentionEveryone) ||
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
			const color = this.logColor(Severity.PERM_MUTE);
			this.punish({ severity: Severity.TEMP_MUTE, reason: 'everyone mention and scam phrase' } as BadWordDetails);
			void this.guild!.sendLogChannel('automod', {
				embeds: [
					new EmbedBuilder()
						.setTitle(`[Severity ${Severity.TEMP_MUTE}] Mention Scam Deleted`)
						.setDescription(
							stripIndent`
							**User:** ${this.user} (${this.user.tag})
							**Sent From:** <#${this.message.channel.id}> [Jump to context](${this.message.url})`
						)
						.addFields({
							name: 'Message Content',
							value: `${await this.client.utils.codeblock(this.message.content, 1024)}`
						})
						.setColor(color)
						.setTimestamp()
				],
				components: [this.buttons(this.user.id, 'everyone mention and scam phrase')]
			});
		}
	}

	protected async checkPerspectiveApi() {
		return;
		if (!this.client.config.isDevelopment) return;

		if (!this.message.content) return;
		this.client.perspective.comments.analyze(
			{
				key: this.client.config.credentials.perspectiveApiKey,
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
	 * Punishes the user based on the severity of the offense
	 * @param highestOffense The highest offense to punish the user for
	 * @returns The color of the embed that the log should, based on the severity of the offense
	 */
	protected punish(highestOffense: BadWordDetails) {
		switch (highestOffense.severity) {
			case Severity.DELETE: {
				void this.message.delete().catch((e) => deleteError.bind(this, e));
				this.punished = true;
				break;
			}
			case Severity.WARN: {
				void this.message.delete().catch((e) => deleteError.bind(this, e));
				void this.member.customWarn({
					moderator: this.guild!.members.me!,
					reason: `[Automod] ${highestOffense.reason}`
				});
				this.punished = true;
				break;
			}
			case Severity.TEMP_MUTE: {
				void this.message.delete().catch((e) => deleteError.bind(this, e));
				void this.member.customMute({
					moderator: this.guild!.members.me!,
					reason: `[Automod] ${highestOffense.reason}`,
					duration: 900_000 // 15 minutes
				});
				this.punished = true;
				break;
			}
			case Severity.PERM_MUTE: {
				void this.message.delete().catch((e) => deleteError.bind(this, e));
				void this.member.customMute({
					moderator: this.guild!.members.me!,
					reason: `[Automod] ${highestOffense.reason}`,
					duration: 0 // permanent
				});
				this.punished = true;
				break;
			}
			default: {
				throw new Error(`Invalid severity: ${highestOffense.severity}`);
			}
		}

		async function deleteError(this: MessageAutomod, e: Error | any) {
			void this.guild?.sendLogChannel('error', {
				embeds: [
					{
						title: 'Automod Error',
						description: `Unable to delete triggered message.`,
						fields: [{ name: 'Error', value: await this.client.utils.codeblock(`${formatError(e)}`, 1024, 'js', true) }],
						color: colors.error
					}
				]
			});
		}
	}

	/**
	 * Log an automod infraction to the guild's specified automod log channel
	 * @param highestOffense The highest severity word found in the message
	 * @param offenses The other offenses that were also matched in the message
	 */
	protected async logMessage(highestOffense: BadWordDetails, offenses: BadWordDetails[]) {
		void this.client.console.info(
			'MessageAutomod',
			`Severity <<${highestOffense.severity}>> action performed on <<${this.user.tag}>> (<<${this.user.id}>>) in <<#${
				(this.message.channel as GuildTextBasedChannel).name
			}>> in <<${this.guild!.name}>>`
		);

		const color = this.logColor(highestOffense.severity);

		await this.guild!.sendLogChannel('automod', {
			embeds: [
				new EmbedBuilder()
					.setTitle(`[Severity ${highestOffense.severity}] Automod Action Performed`)
					.setDescription(
						stripIndent`
						**User:** ${this.user} (${this.user.tag})
						**Sent From:** <#${this.message.channel.id}> [Jump to context](${this.message.url})
						**Blacklisted Words:** ${offenses.map((o) => `\`${o.match}\``).join(', ')}`
					)
					.addFields({
						name: 'Message Content',
						value: `${await this.client.utils.codeblock(this.message.content, 1024)}`
					})
					.setColor(color)
					.setTimestamp()
					.setAuthor({ name: this.user.tag, url: this.user.displayAvatarURL() })
			],
			components: highestOffense.severity >= 2 ? [this.buttons(this.user.id, highestOffense.reason)] : undefined
		});
	}
}
