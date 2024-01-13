import { stripIndent } from '#tags';
import { EmbedBuilder, type GuildMember } from 'discord.js';
import { Automod, type BadWordDetails } from './AutomodShared.js';

export class MemberAutomod extends Automod {
	/**
	 * @param member The member that the automod is checking
	 */
	public constructor(member: GuildMember) {
		super(member);

		if (member.id === member.client.user?.id) return;

		void this.handle();
	}

	protected async handle(): Promise<void> {
		if (this.member.user.bot) return;
		if (this.isImmune) return;

		const badWordsRaw = Object.values(this.client.utils.getShared('badWords')).flat();
		const customAutomodPhrases = (await this.guild.getSetting('autoModPhases')) ?? [];

		const phrases = [...badWordsRaw, ...customAutomodPhrases].filter((p) => p.userInfo);

		const result: BadWordDetails[] = [];

		const str = `${this.member.user.username}${this.member.nickname ? `\n${this.member.nickname}` : ''}`;
		const check = this.checkWords(phrases, str);
		if (check.length > 0) {
			result.push(...check);
		}

		if (result.length > 0) {
			const highestOffense = result.sort((a, b) => b.severity - a.severity)[0];
			await this.logMessage(highestOffense, result, str);
		}
	}

	/**
	 * Log an automod infraction to the guild's specified automod log channel
	 * @param highestOffense The highest severity word found in the message
	 * @param offenses The other offenses that were also matched in the message
	 */
	protected async logMessage(highestOffense: BadWordDetails, offenses: BadWordDetails[], str: string) {
		void this.client.console.info(
			'MemberAutomod',
			`Detected a severity <<${highestOffense.severity}>> automod phrase in <<${this.user.tag}>>'s (<<${this.user.id}>>) username or nickname in <<${this.guild.name}>>`
		);

		const color = this.logColor(highestOffense.severity);

		await this.guild.sendLogChannel('automod', {
			embeds: [
				new EmbedBuilder()
					.setTitle(`[Severity ${highestOffense.severity}] Automoderated User Info Detected`)
					.setDescription(
						stripIndent`
						**User:** ${this.user} (${this.user.tag})
						**Blacklisted Words:** ${offenses.map((o) => `\`${o.match}\``).join(', ')}`
					)
					.addFields({
						name: 'Info',
						value: `${await this.client.utils.codeblock(str, 1024)}`
					})
					.setColor(color)
					.setTimestamp()
					.setAuthor({ name: this.user.tag, url: this.user.displayAvatarURL() })
			],
			components: [this.buttons(this.user.id, highestOffense.reason, false)]
		});
	}
}
