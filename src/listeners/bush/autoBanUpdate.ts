import { AllowedMentions, BotListener, Emitter, colors, formatBanResponse, mappings, type BotClientEvents } from '#lib';
import * as utils from '#lib/utils/Utils.js';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, GuildMember, type TextChannel } from 'discord.js';
import vm from 'node:vm';

export default class AutoBanUpdateListener extends BotListener {
	public constructor() {
		super('autoBanUpdate', {
			emitter: Emitter.Client,
			event: Events.UserUpdate
		});
	}

	public async exec(...[_oldUser, newUser]: BotClientEvents['userUpdate']): Promise<void> {
		if (!this.client.config.isProduction) return;
		if (this.client.isOwner(newUser)) return;

		const member = await this.client.guilds.cache
			.get(mappings.guilds["Moulberry's Bush"])
			?.members.fetch(newUser.id)
			.catch(() => undefined);
		if (!member || !(member instanceof GuildMember)) return;

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

		const shouldBan = banCode != null && Boolean(new vm.Script(banCode).runInContext(ctx));
		const shouldPrompt = shouldBan && promptCode != null && Boolean(new vm.Script(promptCode).runInContext(ctx));

		if (shouldBan) {
			/* const res = await member.customBan({
				reason: `[AutoBan] ${AUTO_BAN_REASON}`,
				moderator: member.guild.members.me!
			});

			if (!['success', 'failed to dm'].includes(res)) {
				return await guild.error(
					'autoBanUpdate',
					`Failed to auto ban ${format.input(user.tag)} for blacklisted name, with error: ${format.input(res)}.`
				);
			} */

			await guild
				.sendLogEmbeds('automod', {
					title: '[TESTING] Auto Ban - User Update',
					description: `**User:** ${user} (${user.tag})\n **Action:** Banned for using blacklisted name.`,
					color: colors.red,
					author: {
						name: user.tag,
						icon_url: member.displayAvatarURL()
					}
				})
				.catch(() => {});

			(<TextChannel>guild.channels.cache.find((c) => /.{0,2}general.{0,2}/.test(c.name)))
				?.send({ content: formatBanResponse(user, 'success' /* res */), allowedMentions: AllowedMentions.none() })
				.catch(() => {});
		} else if (shouldPrompt) {
			await guild
				.sendLogChannel('automod', {
					embeds: [
						{
							title: 'Flagged User - User Update',
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
							new ButtonBuilder({ custom_id: `automod-prompt;${user.id}`, label: 'Ban', style: ButtonStyle.Danger }),
							new ButtonBuilder({
								custom_id: `automod-prompt-dismiss;${user.id}`,
								label: 'Dismiss',
								style: ButtonStyle.Secondary
							})
						)
					]
				})
				.catch(() => {});
		}
	}
}
