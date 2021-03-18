import { BotCommand } from '../../lib/extensions/BotCommand';
import { Message } from 'discord.js';
import { GuildMember } from 'discord.js';
import AllowedMentions from '../../lib/utils/AllowedMentions';
import { Role } from 'discord.js';
////import log from '../../constants/log';

export default class RoleAllCommand extends BotCommand {
	public constructor() {
		super('roleall', {
			aliases: ['roleall', 'rall'],
			category: 'Server Admin',
			description: {
				content: 'Gives (a) role(s) to every member on the server.',
				usage: 'roleAll <role> [another role]... [--humans]',
				examples: ['roleAll 783794633129197589 --humans']
			},
			channel: 'guild',
			ownerOnly: true,
			clientPermissions: ['MANAGE_ROLES', 'SEND_MESSAGES'],
			userPermissions: ['ADMINISTRATOR'], //this is because it would be a pain to undo.
			args: [
				{
					id: 'role',
					type: 'roles',
					match: 'content',
					prompt: {
						start: 'What role(s) would you like to give to every member on the server?',
						retry: '<:no:787549684196704257> Pick (a) valid role(s).'
					}
				},
				{
					id: 'humans',
					type: 'flag',
					flag: '--humans',
					default: false
				}
			],
			typing: true
		});
	}
	public async exec(message: Message, { role, humans }: { role: Role; humans?: boolean }): Promise<void> {
		const failedMembers = [];
		const members = await message.guild.members.fetch();
		for (const member of members.array()) {
			if (member.user.bot && humans == true) {
				////log.debug('1');
				continue;
			}
			if (member.roles.cache.array().includes(role)) {
				////log.debug('2');
				continue;
			}
			try {
				await member.roles.add(role, 'Adding Role(s) to every member.');
			} catch (error) {
				failedMembers.push(member.id);
				this.error(error);
			}
		}
		if (!Array.isArray(failedMembers) || !failedMembers.length) {
			await message.util.reply('Finished adding roles!');
		} else {
			await message.util.reply(`Finished adding roles! Failed members:\n${failedMembers.map((e: GuildMember) => `<@!${e.id}>`).join(' ')}`, {
				allowedMentions: AllowedMentions.none()
			});
		}
	}
}
