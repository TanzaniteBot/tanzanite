import chalk from 'chalk';
import { TextChannel } from 'discord.js';
import { GuildMember, MessageEmbed } from 'discord.js';
import db from '../../constants/db';
import functions from '../../constants/functions';
import log from '../../constants/log';
import { BotListener } from '../../extensions/BotListener';
import { stickyRoleDataSchema } from '../../extensions/mongoose';

export default class OnLeaveListener extends BotListener {
	public constructor() {
		super('OnLeaveListener', {
			emitter: 'client',
			event: 'guildMemberRemove',
			category: 'client'
		});
	}

	public async exec(member: GuildMember): Promise<void> {
		const welcomeChannel: string = (await db.guildGet('welcomeChannel', member.guild.id, '737460457375268896')) as string;
		if (welcomeChannel) {
			let success = true;
			const welcome = <TextChannel>this.client.channels.cache.get(welcomeChannel);
			const embed: MessageEmbed = new MessageEmbed().setDescription(`:cry: \`${member.user.tag}\` left the server. There are now ${welcome.guild.memberCount.toLocaleString()} members.`).setColor('d0021b');
			welcome
				.send(embed)
				.catch(() => {
					log.warn('OnLeave', `Failed to send message for <<${member.user.tag}>> in <<${member.guild.name}>>.`);
					return (success = false);
				})
				.then(() => {
					if (this.client.config.info && success) {
						log.info('OnLeave', `Sent a message for <<${member.user.tag}>> in <<${member.guild.name}>>.`);
					}
				});
		}

		if (member.guild.id == '516977525906341928') {
			const roles = Array.from(member.roles.cache.keys());
			if (roles) {
				const ExistingData = await stickyRoleDataSchema.find({ id: member.id });
				if (ExistingData.length != 0) {
					const Query = await stickyRoleDataSchema.findByIdAndUpdate(ExistingData[0]['_id'], {
						id: member.id,
						left: Date.now(),
						roles: Array.from(member.roles.cache.keys())
					});
					await Query.save().then(() => {
						if (this.client.config.info) {
							log.info('OnLeave', `Updated info for <<${member.user.tag}>>.`);
						}
					});
				} else {
					const roles = new stickyRoleDataSchema({ id: member.id, left: Date.now(), roles: Array.from(member.roles.cache.keys()) });
					await roles.save().then(() => {
						if (this.client.config.info) {
							log.info('OnLeave', `Created info for <<${member.user.tag}>>.`);
						}
					});
				}
			}
		}
	}
}
