import { stripIndent } from '#tags';
import { EmbedBuilder, Presence } from 'discord.js';
import { Automod, BadWordDetails } from './AutomodShared.js';

export class PresenceAutomod extends Automod {
	/**
	 * @param presence The presence that the automod is checking
	 */
	public constructor(public readonly presence: Presence) {
		super(presence.member!);

		if (presence.member!.id === presence.client.user?.id) return;

		void this.handle();
	}

	protected async handle(): Promise<void> {
		if (this.presence.member!.user.bot) return;

		const badWordsRaw = Object.values(this.client.utils.getShared('badWords')).flat();
		const customAutomodPhrases = (await this.guild.getSetting('autoModPhases')) ?? [];

		const phrases = [...badWordsRaw, ...customAutomodPhrases].filter((p) => p.userInfo);

		const result: BadWordDetails[] = [];

		const strings = [];

		for (const activity of this.presence.activities) {
			const str = `${activity.name}${activity.details ? `\n${activity.details}` : ''}${
				activity.buttons.length > 0 ? `\n${activity.buttons.join('\n')}` : ''
			}`;
			const check = this.checkWords(phrases, str);
			if (check.length > 0) {
				result.push(...check);
				strings.push(str);
			}
		}

		if (result.length > 0) {
			const highestOffense = result.sort((a, b) => b.severity - a.severity)[0];
			await this.logMessage(highestOffense, result, strings);
		}
	}

	/**
	 * Log an automod infraction to the guild's specified automod log channel
	 * @param highestOffense The highest severity word found in the message
	 * @param offenses The other offenses that were also matched in the message
	 */
	protected async logMessage(highestOffense: BadWordDetails, offenses: BadWordDetails[], strings: string[]) {
		void this.client.console.info(
			'PresenceAutomod',
			`Detected a severity <<${highestOffense.severity}>> automod phrase in <<${this.user.tag}>>'s (<<${this.user.id}>>) presence in <<${this.guild.name}>>`
		);

		const color = this.logColor(highestOffense.severity);

		await this.guild.sendLogChannel('automod', {
			embeds: [
				new EmbedBuilder()
					.setTitle(`[Severity ${highestOffense.severity}] Automoderated Status Detected`)
					.setDescription(
						stripIndent`
						**User:** ${this.user} (${this.user.tag})
						**Blacklisted Words:** ${offenses.map((o) => `\`${o.match}\``).join(', ')}`
					)
					.addFields(
						(
							await Promise.all(
								strings.map(async (s) => ({
									name: 'Status',
									value: `${await this.client.utils.codeblock(s, 1024)}`
								}))
							)
						).slice(0, 25)
					)
					.setColor(color)
					.setTimestamp()
					.setAuthor({ name: this.user.tag, url: this.user.displayAvatarURL() })
			],
			components: [this.buttons(this.user.id, highestOffense.reason, false)]
		});
	}
}
