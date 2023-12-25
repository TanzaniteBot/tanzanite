import {
	AllowedMentions,
	BotCommand,
	emojis,
	formatRoleResponse,
	mappings,
	parseEvidence,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type OptSlashArgType,
	type SlashMessage
} from '#lib';
import type { ArgumentGeneratorReturn } from '@tanzanite/discord-akairo';
import { ApplicationCommandOptionType, PermissionFlagsBits, type Snowflake } from 'discord.js';
import assert from 'node:assert/strict';

export default class RoleCommand extends BotCommand {
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
					only: 'slash'
				},
				{
					id: 'role',
					description: 'The role you would like to add/remove from the to/from.',
					prompt: 'What role would you like to add/remove from the user?',
					slashType: ApplicationCommandOptionType.Role,
					only: 'slash'
				},
				{
					id: 'duration',
					description: 'The time before the role will be removed (ignored if removing a role).',
					prompt: 'How long would you like to role to last?',
					slashType: ApplicationCommandOptionType.String,
					optional: true,
					only: 'slash'
				},
				{
					id: 'evidence',
					description: 'A shortcut to add an image to use as evidence for the role.',
					only: 'slash',
					prompt: 'What evidence is there for the role?',
					slashType: ApplicationCommandOptionType.Attachment,
					optional: true
				}
			],
			slash: true,
			channel: 'guild',
			flags: ['--force'],
			typing: true,
			clientPermissions: ['ManageRoles', 'EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: []
		});
	}

	public override *args(message: CommandMessage): ArgumentGeneratorReturn {
		const action = (['rr'] as const).includes(message.util.parsed?.alias ?? '')
			? 'remove'
			: (['ar', 'ra'] as const).includes(message.util.parsed?.alias ?? '')
				? 'add'
				: yield {
						type: [['add'], ['remove']],
						prompt: {
							start: 'Would you like to `add` or `remove` a role?',
							retry: '{error} Choose whether you would you like to `add` or `remove` a role.'
						}
					};

		const member = yield {
			type: 'member',
			prompt: {
				start: `What user do you want to ${action} the role ${action === 'add' ? 'to' : 'from'}?`,
				retry: `{error} Choose a valid user to ${action} the role ${action === 'add' ? 'to' : 'from'}.`
			}
		};

		const _role = yield {
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
			evidence?: OptSlashArgType<'attachment'>;
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

		const evidence = parseEvidence(message, args.evidence);

		const responseCode = await args.member[`custom${args.action === 'add' ? 'Add' : 'Remove'}Role`]({
			moderator: message.member!,
			addToModlog: shouldLog,
			role: args.role,
			duration: args.duration,
			evidence: evidence
		});

		await message.util.reply({
			content: formatRoleResponse(args.role.id, args.action, args.duration, args.member, responseCode),
			allowedMentions: AllowedMentions.none()
		});
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
