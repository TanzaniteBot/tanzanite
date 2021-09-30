import { GuildMember, Role } from 'discord.js';
import { AllowedMentions, BushCommand, BushMessage } from '../../lib';

export default class RoleAllCommand extends BushCommand {
	public constructor() {
		super('roleAll', {
			aliases: ['role-all', 'rall'],
			category: 'admin',
			description: {
				content: 'Give a role to every member on the server.',
				usage: 'roleAll <role> [another role]... [--bots]',
				examples: ['roleAll 783794633129197589 --bots']
			},
			args: [
				{
					id: 'role',
					type: 'role',
					prompt: {
						start: 'What role would you like to give to every member on the server?',
						retry: '{error} Pick a valid role.'
					}
				},
				{
					id: 'bots',
					match: 'flag',
					flag: '--bots',
					default: false
				}
			],
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES', 'SEND_MESSAGES'],
			userPermissions: ['ADMINISTRATOR'],
			typing: true
		});
	}

	public override async exec(message: BushMessage, args: { role: Role; bot?: boolean }): Promise<unknown> {
		if (!message.guild) return await message.util.reply(`${util.emojis.error} This command can only be run in a server.`);
		if (!message.member!.permissions.has('ADMINISTRATOR') && !message.member!.user.isOwner())
			return await message.util.reply(`${util.emojis.error} You must have admin perms to use this command.`);

		if (args.role.comparePositionTo(message.guild.me!.roles.highest) >= 0 && !args.role) {
			return await message.util.reply(`${util.emojis.error} I cannot assign a role higher or equal to my highest role.`);
		}

		let members = await message.guild.members.fetch();

		members = members.filter((member: GuildMember) => {
			try {
				if (member.user.bot && !args.bot) return false;
				if (member.roles.cache.has(args.role.id)) return false;
			} catch {
				return false;
			}
			return true;
		});

		await message.util.reply(`${util.emojis.loading} adding roles to ${members.size} members`);

		const promises = members.map((member: GuildMember) => {
			return member.roles.add(args.role, `RoleAll Command - triggered by ${message.author.tag} (${message.author.id})`);
		});

		const failed = (await Promise.allSettled(promises)).filter((val) => val.status === 'rejected');

		if (!failed.length) {
			await message.util.reply({
				content: `${util.emojis.success} Finished adding <@&${args.role.id}> to **${members.size}** member${
					members.size ? 's' : ''
				}.`,
				allowedMentions: AllowedMentions.none()
			});
		} else {
			const array = [...members.values()];
			await message.util.reply({
				content: `${util.emojis.warn} Finished adding <@&${args.role.id}> to **${members.size - failed.length}** member${
					members.size - failed.length ? 's' : ''
				}! Failed members:\n${failed.map((_, index) => `<@${array[index].id}>`).join(' ')}`,
				allowedMentions: AllowedMentions.none()
			});
		}
	}
}
