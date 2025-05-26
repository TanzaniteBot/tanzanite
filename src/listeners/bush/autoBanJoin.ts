import { BotListener, Emitter, colors, mappings, type BotClientEvents } from '#lib';
import * as utils from '#lib/utils/Utils.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } from 'discord.js';
import vm from 'node:vm';

export const AUTO_BAN_REASON = 'Impersonation is not allowed.';

export default class AutoBanJoinListener extends BotListener {
	public constructor() {
		super('autoBanJoin', {
			emitter: Emitter.Client,
			event: Events.GuildMemberAdd
		});
	}

	public async exec(...[member]: BotClientEvents[Events.GuildMemberAdd]): Promise<void> {
		if (!this.client.config.isProduction) return;
		if (this.client.isOwner(member)) return;
		if (member.guild.id !== mappings.guilds["Moulberry's Bush"]) return;

		const banCode = this.client.utils.getShared('autoBanCode');
		const promptCode = this.client.utils.getShared('promptToBanCode');

		const { user, guild } = member;
		const sanitizedUsername = utils.replaceCyrillicLookAlikes(user.username);
		const sanitizedUsernameLower = sanitizedUsername.toLowerCase();

		const ctx = vm.createContext({
			member: member,
			user: member.user,
			guild: member.guild,
			sanitizedUsername,
			sanitizedUsernameLower
		});

		/* eslint-disable @typescript-eslint/no-unsafe-assignment */
		const shouldBan = banCode && new vm.Script(banCode).runInContext(ctx);
		const shouldPrompt = !shouldBan && promptCode && new vm.Script(promptCode).runInContext(ctx);
		/* eslint-enable @typescript-eslint/no-unsafe-assignment */

		if (shouldBan) {
			/* const res = await member.customBan({
				reason: `[AutoBan] ${AUTO_BAN_REASON}`,
				moderator: guild.members.me!
			});

			if (!['success', 'failed to dm'].includes(res)) {
				return await guild.error(
					'autoBanJoin',
					`Failed to auto ban ${format.input(user.tag)} for blacklisted name, with error: ${format.input(res)}.`
				);
			} */

			await guild
				.sendLogChannel('automod', {
					embeds: [
						{
							title: '[TESTING] Auto Ban - User Join',
							description: `**User:** ${user} (${user.tag})\n **Action:** [Would have been] Banned for blacklisted name.`,
							color: colors.red,
							author: {
								name: user.tag,
								icon_url: member.displayAvatarURL()
							}
						}
					],
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder({ custom_id: `automod-prompt;${user.id}`, label: 'Ban', style: ButtonStyle.Danger })
						)
					]
				})
				.catch(() => {});

			// (<TextChannel>guild.channels.cache.find((c) => /.{0,2}general.{0,2}/.test(c.name)))
			// 	?.send({ content: formatBanResponse(user, 'success' /* res */), allowedMentions: AllowedMentions.none() })
			// 	.catch(() => {});
		} else if (shouldPrompt) {
			await guild
				.sendLogChannel('automod', {
					embeds: [
						{
							title: 'Flagged User - User Join',
							description: `**User:** ${user} (${user.tag})\n **Action:** None taken.`,
							color: colors.Gold,
							author: {
								name: user.tag,
								icon_url: member.displayAvatarURL()
							}
						}
					],
					components: [
						new ActionRowBuilder<ButtonBuilder>().addComponents(
							new ButtonBuilder({ custom_id: `automod-prompt;${user.id}`, label: 'Ban', style: ButtonStyle.Danger })
						)
					]
				})
				.catch(() => {});
		}
	}
}
