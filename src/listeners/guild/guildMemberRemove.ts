import { BotListener, Emitter, StickyRole, Time, colors, emojis, format, sleep, type BotClientEvents } from '#lib';
import { EmbedBuilder, type GuildMember, type PartialGuildMember, type TextChannel } from 'discord.js';

export default class GuildMemberRemoveListener extends BotListener {
	public constructor() {
		super('guildMemberRemove', {
			emitter: Emitter.Client,
			event: 'guildMemberRemove'
		});
	}

	public exec(...[member]: BotClientEvents['guildMemberRemove']) {
		void this.sendWelcomeMessage(member);
		void this.stickyRoles(member);
	}

	private async sendWelcomeMessage(member: GuildMember | PartialGuildMember) {
		if (this.client.config.isDevelopment) return;
		const user = member.partial ? await this.client.users.fetch(member.id) : member.user;
		await sleep(50 * Time.Millisecond); // ban usually triggers after member leave

		const isBan = (await member.guild.hasFeature('specifyBanInWelcome')) && member.guild.bans.cache.has(member.id);
		const welcomeChannel = await member.guild.getSetting('welcomeChannel');
		if (welcomeChannel == null) return;
		const welcome = this.client.channels.cache.get(welcomeChannel) as TextChannel | undefined;
		if (member.guild.id !== welcome?.guild.id) throw new Error('Welcome channel must be in the guild.');
		const embed: EmbedBuilder = new EmbedBuilder()
			.setDescription(
				`${emojis.leave} ${format.input(user.tag)} ${
					isBan ? 'got banned from' : 'left'
				} the server. There are now ${welcome.guild.memberCount.toLocaleString()} members.`
			)
			.setColor(isBan ? colors.orange : colors.red);
		welcome
			.send({ embeds: [embed] })
			.then(() =>
				this.client.console.info(
					'guildMemberRemove',
					`Sent a message for ${format.inputLog(user.tag)} in ${format.inputLog(member.guild.name)}.`
				)
			)
			.catch(() =>
				member.guild.error(
					'Welcome Message Error',
					`Failed to send message for ${format.input(user.tag)} in ${format.input(member.guild.name)}.`
				)
			);
	}

	private async stickyRoles(member: GuildMember | PartialGuildMember) {
		if (!(await member.guild.hasFeature('stickyRoles'))) return;
		if (member.partial) {
			await member.guild.members.fetch(); // try to prevent in the future
			throw new Error(`${member.id} is a partial member, cannot save sticky roles.`);
		}
		const rolesArray = member.roles.cache.filter((role) => role.name !== '@everyone').map((role) => role.id);
		const nickname = member.nickname;
		if (rolesArray != null) {
			const [row, isNew] = await StickyRole.findOrBuild({
				where: {
					user: member.user.id,
					guild: member.guild.id
				},
				defaults: {
					user: member.user.id,
					guild: member.guild.id,
					roles: rolesArray
				}
			});
			row.roles = rolesArray;
			if (nickname != null) row.nickname = nickname;
			await row
				.save()
				.then(() =>
					this.client.console.info(
						'guildMemberRemove',
						`${isNew ? 'Created' : 'Updated'} info for ${format.inputLog(member.user.tag)}.`
					)
				);
		}
	}
}
