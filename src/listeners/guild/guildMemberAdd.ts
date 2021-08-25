import { MessageEmbed, Snowflake, Util } from 'discord.js';
import { BushGuildMember, BushListener, BushTextChannel, StickyRole } from '../../lib';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class GuildMemberAddListener extends BushListener {
	public constructor() {
		super('guildMemberAdd', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'client'
		});
	}

	public override async exec(...[member]: BushClientEvents['guildMemberAdd']): Promise<void> {
		void this.sendWelcomeMessage(member);
		void this.joinAndStickyRoles(member);
	}

	public async sendWelcomeMessage(member: BushGuildMember): Promise<void> {
		if (client.config.isDevelopment) return;
		const welcomeChannel = await member.guild.getSetting('welcomeChannel');
		if (!welcomeChannel) return;
		const welcome = this.client.channels.cache.get(welcomeChannel) as BushTextChannel | undefined;
		if (!welcome) return;
		if (member.guild.id !== welcome?.guild.id) throw new Error('Welcome channel must be in the guild.');
		const embed = new MessageEmbed()
			.setDescription(
				`${this.client.util.emojis.join} **${Util.escapeMarkdown(
					member.user.tag
				)}** joined the server. There are now ${member.guild.memberCount.toLocaleString()} members.`
			)
			.setColor(this.client.util.colors.green);
		await welcome
			.send({ embeds: [embed] })
			.then(() => this.client.console.info('OnJoin', `Sent a message for <<${member.user.tag}>> in <<${member.guild.name}>>.`))
			.catch(() =>
				this.client.console.warn('OnJoin', `Failed to send message for <<${member.user.tag}>> in <<${member.guild.name}>>.`)
			);
	}

	public async joinAndStickyRoles(member: BushGuildMember): Promise<void> {
		if (client.config.isDevelopment) return;
		if (await member.guild.hasFeature('stickyRoles')) {
			const hadRoles = await StickyRole.findOne({ where: { guild: member.guild.id, user: member.id } });
			if (hadRoles?.roles?.length) {
				const rolesArray = hadRoles.roles
					.map((roleID: Snowflake) => {
						const role = member.guild.roles.cache.get(roleID);
						if (role && !member.roles.cache.has(roleID)) {
							if (role.name !== '@everyone' || !role.managed) return role.id;
						}
					})
					.filter((role) => role) as Snowflake[];
				if (hadRoles.nickname && member.manageable) {
					void member.setNickname(hadRoles.nickname).catch(() => {});
				}
				if (rolesArray?.length) {
					const addedRoles = await member.roles
						.add(rolesArray, "Returning member's previous roles.")
						.catch(
							() => void this.client.console.warn('ReturnRoles', `There was an error returning <<${member.user.tag}>>'s roles.`)
						);
					if (addedRoles) {
						void this.client.console.info(
							'RoleData',
							`Assigned sticky roles to <<${member.user.tag}>> in <<${member.guild.name}>>.`
						);
					} else if (!addedRoles) {
						const failedRoles: string[] = [];
						for (let i = 0; i < rolesArray.length; i++) {
							await member.roles
								.add(rolesArray[i], "[Fallback] Returning member's previous roles.")
								.catch(() => failedRoles.push(rolesArray[i]));
						}
						if (failedRoles.length) {
							void this.client.console.warn('RoleData', 'Failed assigning the following roles on Fallback:' + failedRoles);
						} else {
							void this.client.console.info(
								'RoleData',
								`[Fallback] Assigned sticky roles to <<${member.user.tag}>> in <<${member.guild.name}>>.`
							);
						}
					}
				}
			}
		} else {
			const joinRoles = await member.guild.getSetting('joinRoles');
			if (!joinRoles) return;
			await member.roles
				.add(joinRoles, 'Join roles.')
				.then(() =>
					this.client.console.info('RoleData', `Assigned join roles to <<${member.user.tag}>> in <<${member.guild.name}>>.`)
				)
				.catch(
					() =>
						void this.client.console.warn(
							'OnJoin',
							`Failed to assign join roles to <<${member.user.tag}>>, in <<${member.guild.name}>>.`
						)
				);
		}
	}
}
