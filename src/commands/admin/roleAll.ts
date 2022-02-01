import { AllowedMentions, BushCommand, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
import { ApplicationCommandOptionType, PermissionFlagsBits, type GuildMember } from 'discord.js';

export default class RoleAllCommand extends BushCommand {
	public constructor() {
		super('roleAll', {
			aliases: ['role-all', 'rall'],
			category: 'admin',
			description: 'Give a role to every member on the server.',
			usage: ['role-all <role> [--bots]'],
			examples: ['role-all 783794633129197589 --bots'],
			args: [
				{
					id: 'role',
					description: 'The role to assigned to every member on the server.',
					type: 'role',
					prompt: 'What role would you like to give to every member on the server?',
					retry: '{error} Pick a valid role.',
					slashType: ApplicationCommandOptionType.Role
				},
				{
					id: 'bots',
					description: 'Also give the role to bots.',
					match: 'flag',
					prompt: 'Would you like to also give roles to bots?',
					flag: '--bots',
					default: false,
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				}
			],
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [PermissionFlagsBits.ManageRoles]),
			userPermissions: [PermissionFlagsBits.Administrator],
			typing: true,
			slash: true
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, args: { role: ArgType<'role'>; bots: ArgType<'boolean'> }) {
		if (!message.inGuild()) return await message.util.reply(`${util.emojis.error} This command can only be run in a server.`);
		if (!message.member!.permissions.has(PermissionFlagsBits.Administrator) && !message.member!.user.isOwner())
			return await message.util.reply(`${util.emojis.error} You must have admin perms to use this command.`);
		if (message.util.isSlashMessage(message)) await message.interaction.deferReply();

		if (args.role.comparePositionTo(message.guild.me!.roles.highest) >= 0 && !args.role) {
			return await message.util.reply(`${util.emojis.error} I cannot assign a role higher or equal to my highest role.`);
		}

		let members = await message.guild.members.fetch();

		members = members.filter((member: GuildMember) => {
			try {
				if (member.user.bot && !args.bots) return false;
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
					members.size > 1 ? 's' : ''
				}.`,
				allowedMentions: AllowedMentions.none()
			});
		} else {
			const array = [...members.values()];
			await message.util.reply({
				content: `${util.emojis.warn} Finished adding <@&${args.role.id}> to **${members.size - failed.length}** member${
					members.size - failed.length > 1 ? 's' : ''
				}! Failed members:\n${failed.map((_, index) => `<@${array[index].id}>`).join(' ')}`,
				allowedMentions: AllowedMentions.none()
			});
		}
	}
}
