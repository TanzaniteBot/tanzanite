import { AllowedMentions, BotListener, colors, emojis, format, mappings, type BotClientEvents } from '#lib';
import { TextChannel } from 'discord.js';

export default class JoinAutoBanListener extends BotListener {
	public constructor() {
		super('joinAutoBan', {
			emitter: 'client',
			event: 'guildMemberAdd'
		});
	}

	public async exec(...[member]: BotClientEvents['guildMemberAdd']): Promise<void> {
		if (!this.client.config.isProduction) return;
		if (member.guild.id !== mappings.guilds["Moulberry's Bush"]) return;
		const guild = member.guild;

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const user = member.user;
		const code = this.client.utils.getShared('autoBanCode');
		if (!code) return;
		if (eval(code)) {
			const res = await member.customBan({
				reason: '[AutoBan] Impersonation is not allowed.',
				moderator: member.guild.members.me!
			});

			if (!['success', 'failed to dm'].includes(res)) {
				return await guild.error(
					'nameAutoBan',
					`Failed to auto ban ${format.input(member.user.tag)} for blacklisted name, with error: ${format.input(res)}.`
				);
			}

			await guild
				.sendLogChannel('automod', {
					embeds: [
						{
							title: 'Name Auto Ban - User Join',
							description: `**User:** ${member.user} (${member.user.tag})\n **Action:** Banned for blacklisted name.`,
							color: colors.red,
							author: {
								name: member.user.tag,
								icon_url: member.displayAvatarURL()
							}
						}
					]
				})
				.catch(() => {});

			const content =
				res === 'failed to dm'
					? `${emojis.warn} Banned ${format.input(member.user.tag)} however I could not send them a dm.`
					: `${emojis.success} Successfully banned ${format.input(member.user.tag)}.`;

			(<TextChannel>guild.channels.cache.find((c) => c.name === 'general'))
				?.send({ content, allowedMentions: AllowedMentions.none() })
				.catch(() => {});
		}
	}
}
