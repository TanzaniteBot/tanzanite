import {
	addRoleResponse,
	AllowedMentions,
	BushCommand,
	clientSendAndPermCheck,
	emojis,
	format,
	humanizeDuration,
	mappings,
	removeRoleResponse,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import assert from 'assert/strict';
import { type ArgumentGeneratorReturn } from 'discord-akairo';
import { ApplicationCommandOptionType, PermissionFlagsBits, type Snowflake } from 'discord.js';

export default class RoleCommand extends BushCommand {
	public constructor() {
		super('role', {
			aliases: ['role', 'rr', 'ar', 'ra'],
			category: 'moderation',
			description: "Manages users' roles.",
			usage: ['role <add|remove> <member> <role> [duration]'],
			examples: ['role add spammer nogiveaways 7days', 'ra tyman muted', 'rr tyman staff'],
			args: [
				{
					id: 'action',
					description: 'Whether to add or remove a role for the the user.',
					prompt: 'Would you like to add or remove a role?',
					slashType: ApplicationCommandOptionType.String,
					choices: [
						{ name: 'add', value: 'add' },
						{ name: 'remove', value: 'remove' }
					],
					only: 'slash'
				},
				{
					id: 'member',
					description: 'The user to add/remove a role to/from.',
					prompt: 'What user do you want to add/remove a role to/from?',
					slashType: ApplicationCommandOptionType.User,
					slashResolve: 'Member',
					optional: true,
					only: 'slash'
				},
				{
					id: 'role',
					description: 'The role you would like to add/remove from the to/from.',
					prompt: 'What role would you like to add/remove from the user?',
					slashType: ApplicationCommandOptionType.Role,
					optional: true,
					only: 'slash'
				},
				{
					id: 'duration',
					description: 'The time before the role will be removed (ignored if removing a role).',
					prompt: 'How long would you like to role to last?',
					slashType: ApplicationCommandOptionType.String,
					optional: true,
					only: 'slash'
				}
			],
			slash: true,
			channel: 'guild',
			flags: ['--force'],
			typing: true,
			clientPermissions: (m) =>
				clientSendAndPermCheck(m, [PermissionFlagsBits.ManageRoles, PermissionFlagsBits.EmbedLinks], true),
			userPermissions: []
		});
	}

	public override *args(message: CommandMessage): ArgumentGeneratorReturn {
		const action = (['rr'] as const).includes(message.util.parsed?.alias ?? '')
			? 'remove'
			: (['ar', 'ra'] as const).includes(message.util.parsed?.alias ?? '')
			? 'add'
			: yield {
					id: 'action',
					type: [['add'], ['remove']],
					prompt: {
						start: 'Would you like to `add` or `remove` a role?',
						retry: '{error} Choose whether you would you like to `add` or `remove` a role.'
					}
			  };

		const member = yield {
			id: 'user',
			type: 'member',
			prompt: {
				start: `What user do you want to ${action} the role ${action === 'add' ? 'to' : 'from'}?`,
				retry: `{error} Choose a valid user to ${action} the role ${action === 'add' ? 'to' : 'from'}.`
			}
		};

		const _role = yield {
			id: 'role',
			type: `${action === 'add' ? 'roleWithDuration' : 'role'}`,
			match: 'rest',
			prompt: {
				start: `What role do you want to ${action} ${action === 'add' ? 'to' : 'from'} the user${
					action === 'add' ? ', and for how long' : ''
				}?`,
				retry: `{error} Choose a valid role to ${action}.`
			}
		};

		const force = yield {
			id: 'force',
			description: 'Override permission checks and ban the user anyway.',
			flag: '--force',
			match: 'flag'
		};

		return {
			action,
			member: member,
			role: (_role as ArgType<'roleWithDuration'>).role ?? _role,
			duration: (_role as ArgType<'roleWithDuration'>).duration,
			force
		};
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: {
			action: 'add' | 'remove';
			member: ArgType<'member'>;
			role: ArgType<'role'>;
			duration: OptArgType<'duration'>;
			force?: ArgType<'flag'>;
		}
	) {
		assert(message.inGuild());
		if (!args.role) return await message.util.reply(`${emojis.error} You must specify a role.`);
		args.duration ??= 0;
		if (
			!message.member!.permissions.has(PermissionFlagsBits.ManageRoles) &&
			message.member!.id !== message.guild?.ownerId &&
			!message.member!.user.isOwner()
		) {
			let mappedRole: { name: string; id: string };
			for (let i = 0; i < mappings.roleMap.length; i++) {
				const a = mappings.roleMap[i];
				if (a.id === args.role.id) mappedRole = a;
			}
			if (!mappedRole! || !(mappedRole.name in mappings.roleWhitelist)) {
				return await message.util.reply({
					content: `${emojis.error} <@&${args.role.id}> is not whitelisted, and you do not have manage roles permission.`,
					allowedMentions: AllowedMentions.none()
				});
			}
			const allowedRoles = mappings.roleWhitelist[mappedRole.name as keyof typeof mappings.roleWhitelist].map((r) => {
				for (let i = 0; i < mappings.roleMap.length; i++) {
					if (mappings.roleMap[i].name == r) return mappings.roleMap[i].id;
				}
				return;
			});
			if (!message.member!.roles.cache.some((role) => (allowedRoles as Snowflake[]).includes(role.id))) {
				return await message.util.reply({
					content: `${emojis.error} <@&${args.role.id}> is whitelisted, but you do not have any of the roles required to manage it.`,
					allowedMentions: AllowedMentions.none()
				});
			}
		}

		const shouldLog = this.punishmentRoleNames.includes(args.role.name);

		const responseCode = await args.member[`bush${args.action === 'add' ? 'Add' : 'Remove'}Role`]({
			moderator: message.member!,
			addToModlog: shouldLog,
			role: args.role,
			duration: args.duration
		});

		const responseMessage = (): string => {
			const victim = format.input(args.member.user.tag);
			switch (responseCode) {
				case addRoleResponse.MISSING_PERMISSIONS:
					return `${emojis.error} I don't have the **Manage Roles** permission.`;
				case addRoleResponse.USER_HIERARCHY:
					return `${emojis.error} <@&${args.role.id}> is higher or equal to your highest role.`;
				case addRoleResponse.ROLE_MANAGED:
					return `${emojis.error} <@&${args.role.id}> is managed by an integration and cannot be managed.`;
				case addRoleResponse.CLIENT_HIERARCHY:
					return `${emojis.error} <@&${args.role.id}> is higher or equal to my highest role.`;
				case addRoleResponse.MODLOG_ERROR:
					return `${emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
				case addRoleResponse.PUNISHMENT_ENTRY_ADD_ERROR:
				case removeRoleResponse.PUNISHMENT_ENTRY_REMOVE_ERROR:
					return `${emojis.error} There was an error ${
						args.action === 'add' ? 'creating' : 'removing'
					} a punishment entry, please report this to my developers.`;
				case addRoleResponse.ACTION_ERROR:
					return `${emojis.error} An error occurred while trying to ${args.action} <@&${args.role.id}> ${
						args.action === 'add' ? 'to' : 'from'
					} ${victim}.`;
				case addRoleResponse.SUCCESS:
					return `${emojis.success} Successfully ${args.action === 'add' ? 'added' : 'removed'} <@&${args.role.id}> ${
						args.action === 'add' ? 'to' : 'from'
					} ${victim}${args.duration ? ` for ${humanizeDuration(args.duration)}` : ''}.`;
				default:
					return `${emojis.error} An error occurred: ${format.input(responseCode)}}`;
			}
		};

		await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}

	private punishmentRoleNames = [
		'No Files',
		'No Links',
		'No Threads',
		'No Reactions',
		'No Bots',
		'No VC',
		'No Giveaways',
		'Limited Server Access'
	];
}
