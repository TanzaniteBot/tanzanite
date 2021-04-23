import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { BushListener } from '../../lib/extensions/BushListener';
import { stickyRoleDataSchema } from '../../lib/utils/mongoose';
import log from '../../lib/utils/log';
import db from '../../constants/db';

export default class OnJoinListener extends BushListener {
	public constructor() {
		super('OnJoinListener', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'client'
		});
	}

	public async exec(member: GuildMember): Promise<void> {
		if (this.client.config.environment !== 'development') {
			let welcomeChannel: string = (await db.guildGet('welcomeChannel', member.guild.id, null)) as string;
			let success = true;
			if (!welcomeChannel && member.guild.id === '516977525906341928') {
				welcomeChannel = '737460457375268896';
			}
			if (welcomeChannel) {
				const welcome = <TextChannel>this.client.channels.cache.get(welcomeChannel);
				if (member.guild.id != welcome.guild.id) throw 'Welcome channel must be in the guild.';
				const embed: MessageEmbed = new MessageEmbed()
					.setDescription(`:slight_smile: \`${member.user.tag}\` joined the server. There are now ${member.guild.memberCount.toLocaleString()} members.`)
					.setColor('7ed321');
				await welcome
					.send(embed)
					.catch(() => {
						log.warn('OnJoin', `Failed to send message for <<${member.user.tag}>> in <<${member.guild.name}>>.`);
						return (success = false);
					})
					.then(() => {
						if (this.client.config.info && success) {
							log.info('OnJoin', `Sent a message for <<${member.user.tag}>> in <<${member.guild.name}>>.`);
						}
					});
			}

			if (member.guild.id == '516977525906341928') {
				let RoleSuccess = true;
				const hadRoles = await stickyRoleDataSchema.find({ id: member.id });
				const rolesArray: Array<string> = [];
				hadRoles[0]['roles'].forEach((roleID: string) => {
					const role = member.guild.roles.cache.get(roleID);
					if (role.name != '@everyone') rolesArray.push(role.id);
				});
				if (rolesArray && rolesArray.length != 0) {
					await member.roles
						.add(rolesArray, "Returning member's previous roles.")
						.catch(() => {
							log.warn('RoleData', `Failed to assign sticky roles for <<${member.user.tag}>> in <<${member.guild.name}>>.`);
							return (RoleSuccess = false);
						})
						.then(async () => {
							if (this.client.config.info && success) {
								log.info('RoleData', `Assigned sticky roles to <<${member.user.tag}>> in <<${member.guild.name}>>.`);
							} else {
								const failedRoles: string[] = [];
								for (let i = 0; i < rolesArray.length; i++) {
									try {
										await member.roles.add(rolesArray[i], "[Fallback] Returning member's previous roles.");
									} catch {
										failedRoles.push(rolesArray[i]);
									}
								}
								if (failedRoles.length > 0) console.debug('[RoleData] Failed assigning the following roles on Fallback:' + failedRoles);
							}
						});
				} else {
					await member.roles
						.add(['783794633129197589', '801976603772321796'], 'Join roles.')
						.catch(() => {
							log.warn('OnJoin', `Failed to assign join roles to <<${member.user.tag}>>, in <<${member.guild.name}>>.`);
							return (RoleSuccess = false);
						})
						.then(() => {
							if (this.client.config.info && RoleSuccess) {
								log.info('RoleData', `Assigned join roles to <<${member.user.tag}>> in <<${member.guild.name}>>.`);
							}
						});
				}
			}
		}
	}
}
