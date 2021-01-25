import { BotCommand } from '../../extensions/BotCommand';
import { Message } from 'discord.js';
import { GuildMember } from 'discord.js';
import AllowedMentions from '../../extensions/AllowedMentions';

export default class RoleAllCommand extends BotCommand {
	public constructor() {
		super('RoleAll', {
			aliases: ['RoleAll'],
			category: 'Server Admin',
			description: {
				content: 'Gives (a) role(s) to every member on the server.',
				usage: 'FixMute',
				examples: ['FixMute'],
			},
			channel: 'guild',
			ownerOnly: true,
			clientPermissions: ['MANAGE_ROLES'], 
			userPermissions: ['ADMINISTRATOR'],
			args: [
				{
					id: 'role',
					type: 'roles',
					match: 'content',
					prompt: {
						start: 'What role(s) would you like to give to every member on the server?',
					},
				},
			],
		});
	}
	public async exec(message: Message, { role }:{ role:string }): Promise<void> {
		const failedMembers = [];
		for (const member of message.guild.members.cache.array()) {
			try {
				await member.roles.add(role, 'Adding Roles to every member.');
			} catch (e) {
				console.log(e.stack);
				failedMembers.push(member.id);
			}
		}
		await message.util.send(`Finished adding roles! Failed members:\n${failedMembers.map((e: GuildMember) => `<@!${e.id}>`).join(' ')}`, {
			allowedMentions: AllowedMentions.none()
		});
	}
}
