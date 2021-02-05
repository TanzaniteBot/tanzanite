import { BotCommand      } from '../../extensions/BotCommand'     ;
import { Message         } from 'discord.js'                      ;
import { GuildMember     } from 'discord.js'                      ;
import   AllowedMentions   from '../../extensions/AllowedMentions';

export default class RoleAllCommand extends BotCommand {
	public constructor() {
		super('roleAll', {
			aliases: ['roleAll, rall'],
			category: 'Server Admin',
			description: {
				content: 'Gives (a) role(s) to every member on the server.',
				usage: 'roleAll <role> [another role]...',
				examples: ['roleAll 783794633129197589'],
			},
			channel: 'guild',
			ownerOnly: true,
			clientPermissions: ['MANAGE_ROLES'], 
			userPermissions: ['ADMINISTRATOR'], //this is because it would be a pain to undo.
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
		const members = await message.guild.members.fetch()
		for (const member of members.array()) {
			try {
				await member.roles.add(role, 'Adding Roles to every member.');
			} catch (error) {
				failedMembers.push(member.id);
				this.error(error)
			}
		}
		if(!Array.isArray(failedMembers) || !failedMembers.length){ 
			await message.util.send('Finished adding roles!')
		}else{
			await message.util.send(`Finished adding roles! Failed members:\n${failedMembers.map((e: GuildMember) => `<@!${e.id}>`).join(' ')}`, {
				allowedMentions: AllowedMentions.none()
			});
		}
	}
}
