import { AllowedMentions, BotCommand, emojis, type ArgType, type CommandMessage, type OptArgType, type SlashMessage } from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';
import assert from 'node:assert/strict';

export default class LevelRolesCommand extends BotCommand {
	public constructor() {
		super('levelRole', {
			aliases: ['level-role', 'level-roles', 'lr'],
			category: 'config',
			description: 'Configure roles to be assigned to users upon reaching certain levels.',
			note: 'Omit the role to remove the role. View configured roles with `-config levelRoles`.',
			usage: ['level-role <level> [role]'],
			examples: ['level-role 100 @Super Cool Role'],
			args: [
				{
					id: 'level',
					type: 'integer',
					description: 'The level to assign the role when reached.',
					prompt: 'What level would you like to set a role for when reached?',
					retry: '{error} Pick a valid integer representing the role to assign a role to when reached.',
					slashType: ApplicationCommandOptionType.Integer
				},
				{
					id: 'role',
					type: 'role',
					match: 'rest',
					description: 'The role to assign to a user who reaches the specified level.',
					prompt: 'What role would you like to assign to users when they reach that level?',
					retry: '{error} Choose a valid role to assign to users upon reaching the specified level.',
					slashType: ApplicationCommandOptionType.Role,
					optional: true
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: ['ManageRoles'],
			userPermissions: ['ManageGuild', 'ManageRoles']
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { level: ArgType<'integer'>; role: OptArgType<'role'> }
	) {
		assert(message.inGuild());
		assert(message.member);

		if (!(await message.guild.hasFeature('leveling'))) {
			return await reply(`${emojis.error} This command can only be run in servers with the leveling feature enabled.`);
		}

		if (args.level < 1) return await reply(`${emojis.error} You cannot set a level role less than **1**.`);

		if (args.role) {
			if (args.role.managed)
				return await reply(`${emojis.error} You cannot set <@${args.role.id}> as a level role since it is managed.`);
			else if (args.role.id === message.guild.id)
				return await reply(`${emojis.error} You cannot set the @everyone role as a level role.`);
			else if (args.role.comparePositionTo(message.member.roles.highest) >= 0)
				return await reply(`${emojis.error} <@${args.role.id}> is higher or equal to your highest role.`);
			else if (args.role.comparePositionTo(message.guild.members.me!.roles.highest) >= 0)
				return await reply(`${emojis.error} <@${args.role.id}> is higher or equal to my highest role.`);
		}

		const oldRoles = Object.freeze(await message.guild.getSetting('levelRoles'));
		const newRoles = { ...oldRoles };

		if (args.role) {
			newRoles[args.level] = args.role.id;
		} else {
			delete newRoles[args.level];
		}
		Object.freeze(newRoles);

		const success = await message.guild.setSetting('levelRoles', newRoles, message.member).catch(() => false);

		if (!success) return await reply(`${emojis.error} An error occurred while setting the level roles.`);

		if (!oldRoles[args.level] && newRoles[args.level]) {
			return await reply(`${emojis.success} The level role for **${args.level}** is now <@&${newRoles[args.level]}>.`);
		} else if (oldRoles[args.level] && !newRoles[args.level]) {
			return await reply(
				`${emojis.success} The level role for **${args.level}** was <@&${oldRoles[args.level]}> but is now disabled.`
			);
		} else if (oldRoles[args.level] && newRoles[args.level]) {
			return await reply(
				`${emojis.success} The level role for **${args.level}** has been updated from <@&${oldRoles[args.level]}> to <@&${
					newRoles[args.level]
				}>.`
			);
		}

		function reply(str: string) {
			return message.util.reply({
				content: str,
				allowedMentions: AllowedMentions.none()
			});
		}
	}
}
