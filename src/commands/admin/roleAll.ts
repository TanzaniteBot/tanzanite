import { GuildMember, Role } from 'discord.js';
import { AllowedMentions, BushCommand, BushMessage } from '../../lib';

export default class RoleAllCommand extends BushCommand {
	public constructor() {
		super('roleAll', {
			aliases: ['roleall', 'rall'],
			category: 'Server Admin',
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
		if (!message.member!.permissions.has('ADMINISTRATOR'))
			return await message.util.reply(`${this.client.util.emojis.error} You must have admin perms to use this command.`);

		if (args.role.comparePositionTo(message.guild.me!.roles.highest) >= 0 && !args.role) {
			return await message.util.reply(
				`${this.client.util.emojis.error} I cannot assign a role higher or equal to my highest role.`
			);
		}

		console.time('roleAll1');
		let members = await message.guild.members.fetch();
		console.timeEnd('roleAll1');

		console.time('roleAll2');
		members = members.filter((member: GuildMember) => {
			try {
				if (member.user.bot && !args.bot) return false;
				if (member.roles.cache.has(args.role.id)) return false;
			} catch {
				return false;
			}
			return true;
		});
		console.timeEnd('roleAll2');

		console.time('roleAll3');
		await message.util.reply(`${this.client.util.emojis.loading} adding roles to ${members.size} members`);
		console.timeEnd('roleAll3');

		console.time('roleAll4');
		const promises = members.map((member: GuildMember) => {
			return member.roles.add(args.role, `RoleAll Command - triggered by ${message.author.tag} (${message.author.id})`);
		});
		console.timeEnd('roleAll4');

		console.time('roleAll5');
		const failed = (await Promise.allSettled(promises)).filter((val) => val.status === 'rejected');
		console.timeEnd('roleAll5');

		if (!failed.length) {
			await message.util.reply({
				content: `${this.client.util.emojis.success} Finished adding <@&${args.role.id}> to **${members.size}** member${
					members.size ? 's' : ''
				}.`,
				allowedMentions: AllowedMentions.none()
			});
		} else {
			const array = [...members.values()];
			await message.util.reply({
				content: `${this.client.util.emojis.warn} Finished adding <@&${args.role.id}> to **${
					members.size - failed.length
				}** member${members.size - failed.length ? 's' : ''}! Failed members:\n${failed
					.map((_, index) => `<@${array[index].id}>`)
					.join(' ')}`,
				allowedMentions: AllowedMentions.none()
			});
		}
	}
}
