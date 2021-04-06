import { TextChannel } from 'discord.js';
import { GuildMember, MessageEmbed } from 'discord.js';
import db from '../../constants/db';
import log from '../../lib/utils/log';
import { BushListener } from '../../lib/extensions/BushListener';
import { stickyRoleDataSchema } from '../../lib/utils/mongoose';

export default class OnLeaveListener extends BushListener {
	public constructor() {
		super('OnLeaveListener', {
			emitter: 'client',
			event: 'guildMemberRemove',
			category: 'client'
		});
	}

	public async exec(member: GuildMember): Promise<void> {
		if (this.client.config.environment !== 'development') {
			const welcomeChannel: string = (await db.guildGet(
				'welcomeChannel',
				member.guild.id,
				null
			)) as string;
			if (welcomeChannel) {
				let success = true;
				const welcome = <TextChannel>this.client.channels.cache.get(welcomeChannel);
				if (member.guild.id != welcome.guild.id) throw 'Welcome channel must be in the guild.';
				const embed: MessageEmbed = new MessageEmbed()
					.setDescription(
						`:cry: \`${
							member.user.tag
						}\` left the server. There are now ${welcome.guild.memberCount.toLocaleString()} members.`
					)
					.setColor('d0021b');
				welcome
					.send(embed)
					.catch(() => {
						log.warn(
							'OnLeave',
							`Failed to send message for <<${member.user.tag}>> in <<${member.guild.name}>>.`
						);
						return (success = false);
					})
					.then(() => {
						if (this.client.config.info && success) {
							log.info(
								'OnLeave',
								`Sent a message for <<${member.user.tag}>> in <<${member.guild.name}>>.`
							);
						}
					});
			}

			if (member.guild.id == '516977525906341928') {
				const roles = Array.from(member.roles.cache.keys());
				if (roles) {
					const ExistingData = await stickyRoleDataSchema.find({
						id: member.id
					});
					if (ExistingData.length != 0) {
						const Query = await stickyRoleDataSchema.findByIdAndUpdate(ExistingData[0]['_id'], {
							id: member.id,
							left: Date.now(),
							roles: Array.from(member.roles.cache.keys())
						});
						await Query.save().then(() => {
							if (this.client.config.info) {
								log.info('RoleData', `Updated info for <<${member.user.tag}>>.`);
							}
						});
					} else {
						const roles = new stickyRoleDataSchema({
							id: member.id,
							left: Date.now(),
							roles: Array.from(member.roles.cache.keys())
						});
						await roles.save().then(() => {
							if (this.client.config.info) {
								log.info('RoleData', `Created info for <<${member.user.tag}>>.`);
							}
						});
					}
				}
			}
		}
	}
}
