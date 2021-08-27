import { MessageEmbed, Util } from 'discord.js';
import { BushGuildMember, BushListener, BushTextChannel, PartialBushGuildMember, StickyRole } from '../../lib';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class GuildMemberRemoveListener extends BushListener {
	public constructor() {
		super('guildMemberRemove', {
			emitter: 'client',
			event: 'guildMemberRemove',
			category: 'guild'
		});
	}

	public override async exec(...[member]: BushClientEvents['guildMemberRemove']): Promise<void> {
		void this.sendWelcomeMessage(member);
		void this.stickyRoles(member);
	}

	public async sendWelcomeMessage(member: BushGuildMember | PartialBushGuildMember): Promise<void> {
		if (client.config.isDevelopment) return;
		const user = member.partial ? await client.users.fetch(member.id) : member.user;
		await util.sleep(0.05); // ban usually triggers after member leave
		const isBan = member.guild.bans.cache.has(member.id);
		const welcomeChannel = await member.guild.getSetting('welcomeChannel');
		if (!welcomeChannel) return;
		const welcome = this.client.channels.cache.get(welcomeChannel) as BushTextChannel | undefined;
		if (member.guild.id !== welcome?.guild.id) throw new Error('Welcome channel must be in the guild.');
		const embed: MessageEmbed = new MessageEmbed()
			.setDescription(
				`${this.client.util.emojis.leave} **${Util.escapeBold(user.tag)}** ${
					isBan ? 'banned from' : 'left'
				} the server. There are now ${welcome.guild.memberCount.toLocaleString()} members.`
			)
			.setColor(isBan ? util.colors.orange : util.colors.red);
		welcome
			.send({ embeds: [embed] })
			.then(() => client.console.info('guildMemberRemove', `Sent a message for <<${user.tag}>> in <<${member.guild.name}>>.`))
			.catch(() =>
				this.client.console.warn('guildMemberRemove', `Failed to send message for <<${user.tag}>> in <<${member.guild.name}>>.`)
			);
	}

	public async stickyRoles(member: BushGuildMember | PartialBushGuildMember): Promise<void> {
		if (!(await member.guild.hasFeature('stickyRoles'))) return;
		if (member.partial) throw new Error('Partial member, cannot save sticky roles.');
		const rolesArray = member.roles.cache.filter((role) => role.name !== '@everyone').map((role) => role.id);
		const nickname = member.nickname;
		if (rolesArray) {
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
			if (nickname) row.nickname = nickname;
			await row
				.save()
				.then(() =>
					this.client.console.info('guildMemberRemove', `${isNew ? 'Created' : 'Updated'} info for <<${member.user.tag}>>.`)
				);
		}
	}
}
