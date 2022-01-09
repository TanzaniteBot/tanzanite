import { AllowedMentions, BushListener, type BushClientEvents, type BushTextChannel } from '#lib';

export default class JoinAutoBanListener extends BushListener {
	public constructor() {
		super('joinAutoBan', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'bush'
		});
	}

	public override async exec(...[member]: BushClientEvents['guildMemberAdd']): Promise<void> {
		if (!client.config.isProduction) return;
		if (member.guild.id !== client.consts.mappings.guilds.bush) return;
		const guild = member.guild;

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const user = member.user;
		const code = util.getShared('autoBanCode');
		if (!code) return;
		if (eval(code)) {
			const res = await member.bushBan({
				reason: '[AutoBan] Impersonation is not allowed.',
				moderator: member.guild.me!
			});

			if (!['success', 'failed to dm'].includes(res)) {
				return await guild.error(
					'nameAutoBan',
					`Failed to auto ban ${util.format.input(member.user.tag)} for blacklisted name, with error: ${util.format.input(res)}.`
				);
			}

			await guild
				.sendLogChannel('automod', {
					embeds: [
						{
							title: 'Name Auto Ban - User Join',
							description: `**User:** ${member.user} (${member.user.tag})\n **Action:** Banned for blacklisted name.`,
							color: client.consts.colors.red,
							author: {
								name: member.user.tag,
								iconURL: member.displayAvatarURL({ dynamic: true })
							}
						}
					]
				})
				.catch(() => {});

			const content =
				res === 'failed to dm'
					? `${util.emojis.warn} Banned ${util.format.input(member.user.tag)} however I could not send them a dm.`
					: `${util.emojis.success} Successfully banned ${util.format.input(member.user.tag)}.`;

			(<BushTextChannel>guild.channels.cache.find((c) => c.name === 'general'))
				?.send({ content, allowedMentions: AllowedMentions.none() })
				.catch(() => {});
		}
	}
}
