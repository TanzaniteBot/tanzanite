import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import db from '../../constants/db';
import { BotListener } from '../../extensions/BotListener';
import { stickyRoleDataSchema } from '../../extensions/mongoose';

export default class OnJoinListener extends BotListener {
	public constructor() {
		super('OnJoinListener', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'client'
		});
	}

	public async exec(member: GuildMember): Promise<void> {
		let welcomeChannel: string = (await db.guildGet('welcomeChannel', member.guild.id, null)) as string;
		if (!welcomeChannel && member.guild.id === '516977525906341928') {
			welcomeChannel = '737460457375268896';
		}
		if (welcomeChannel) {
			const welcome = <TextChannel>this.client.channels.cache.get(welcomeChannel);
			if (member.guild.id != welcome.guild.id) throw 'Welcome channel must be in the guild.';
			const embed: MessageEmbed = new MessageEmbed()
				.setDescription(
					`:slight_smile: \`${member.user.tag}\` joined the server. There are now ${member.guild.memberCount.toLocaleString()} members.`
				)
				.setColor('7ed321');
			await welcome.send(embed).catch(() => {
				console.warn(`[OnJoin] Failed to send message for ${member.user.tag} in ${member.guild.name}`);
			});
		}

		if (member.guild.id == '516977525906341928') {
			const hadRoles = await stickyRoleDataSchema.find({ id: member.id });
			if (hadRoles && hadRoles.length != 0) {
				await member.roles.add(hadRoles[0]['roles'], "Returning member's previous roles.").catch(() => {
					console.warn(`[OnJoin] Failed to assign sticky roles to ${member.user.tag} in ${member.guild.name}.`);
				});
			} else {
				await member.roles.add(['783794633129197589', '801976603772321796'], 'Join roles.').catch(() => {
					console.warn(`[OnJoin] Failed to assign join roles to ${member.user.tag}, in ${member.guild.name}.`);
				});
			}
		}
	}
}
