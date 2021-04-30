import { BushCommand, PermissionLevel } from '../../lib/extensions/BushCommand';
import AllowedMentions from '../../lib/utils/AllowedMentions';
import { Message, GuildMember, Role } from 'discord.js';

export default class RoleAllCommand extends BushCommand {
	public constructor() {
		super('roleall', {
			aliases: ['roleall', 'rall'],
			category: 'Server Admin',
			description: {
				content: 'Gives (a) role(s) to every member on the server.',
				usage: 'roleAll <role> [another role]... [--humans]',
				examples: ['roleAll 783794633129197589 --humans']
			},
			args: [
				{
					id: 'role',
					type: 'roles',
					match: 'content',
					prompt: {
						start: 'What role(s) would you like to give to every member on the server?',
						retry: '<:error:837123021016924261> Pick (a) valid role(s).'
					}
				},
				{
					id: 'humans',
					type: 'flag',
					flag: '--humans',
					default: false
				}
			],
			channel: 'guild',
			permissionLevel: PermissionLevel.Owner,
			clientPermissions: ['MANAGE_ROLES', 'SEND_MESSAGES'],
			userPermissions: ['ADMINISTRATOR'],
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