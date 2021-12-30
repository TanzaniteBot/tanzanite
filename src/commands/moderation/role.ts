import { AllowedMentions, BushCommand, type ArgType, type BushMessage, type BushSlashMessage, type OptionalArgType } from '#lib';
import { type ArgumentOptions, type Flag } from 'discord-akairo';
import { type Snowflake } from 'discord.js';

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
					slashType: 'STRING',
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
					slashType: 'USER',
					slashResolve: 'member',
					optional: true,
					only: 'slash'
				},
				{
					id: 'role',
					description: 'The role you would like to add/remove from the to/from.',
					prompt: 'What role would you like to add/remove from the user?',
					slashType: 'ROLE',
					optional: true,
					only: 'slash'
				},
				{
					id: 'duration',
					description: 'The time before the role will be removed (ignored if removing a role).',
					prompt: 'How long would you like to role to last?',
					slashType: 'STRING',
					optional: true,
					only: 'slash'
				}
			],
			slash: true,
			channel: 'guild',
			typing: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['MANAGE_ROLES', 'EMBED_LINKS'], true),
			userPermissions: []
		});
	}

	public override *args(message: BushMessage): Generator<ArgumentOptions | Flag> {
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
		message: BushMessage | BushSlashMessage,
		args: {
			action: 'add' | 'remove';
			member: ArgType<'member'>;
			role: ArgType<'role'>;
			duration?: OptionalArgType<'duration'>;
			force?: boolean;
		}
	) {
		if (!args.role) return await message.util.reply(`${util.emojis.error} You must specify a role.`);
		if (args.duration === null) args.duration = 0;
		if (
			!message.member!.permissions.has('MANAGE_ROLES') &&
			message.member!.id !== message.guild?.ownerId &&
			!message.member!.user.isOwner()
		) {
			const mappings = client.consts.mappings;
			let mappedRole: { name: string; id: string };
			for (let i = 0; i < mappings.roleMap.length; i++) {
				const a = mappings.roleMap[i];
				if (a.id === args.role.id) mappedRole = a;
			}
			if (!mappedRole! || !(mappedRole.name in mappings.roleWhitelist)) {
				return await message.util.reply({
					content: `${util.emojis.error} <@&${args.role.id}> is not whitelisted, and you do not have manage roles permission.`,
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
					content: `${util.emojis.error} <@&${args.role.id}> is whitelisted, but you do not have any of the roles required to manage it.`,
					allowedMentions: AllowedMentions.none()
				});
			}
		}

		const shouldLog = this.punishmentRoleNames.includes(args.role.name);

		const responseCode =
			args.action === 'add'
				? await args.member.addRole({
						moderator: message.member!,
						addToModlog: shouldLog,
						role: args.role,
						duration: args.duration
				  })
				: await args.member.removeRole({
						moderator: message.member!,
						addToModlog: shouldLog,
						role: args.role,
						duration: args.duration
				  });

		const responseMessage = () => {
			const victim = util.format.input(args.member.user.tag);
			switch (responseCode) {
				case 'user hierarchy':
					return `${util.emojis.error} <@&${args.role.id}> is higher or equal to your highest role.`;
				case 'role managed':
					return `${util.emojis.error} <@&${args.role.id}> is managed by an integration and cannot be managed.`;
				case 'client hierarchy':
					return `${util.emojis.error} <@&${args.role.id}> is higher or equal to my highest role.`;
				case 'error creating modlog entry':
					return `${util.emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
				case 'error creating role entry' || 'error removing role entry':
					return `${util.emojis.error} There was an error ${
						args.action === 'add' ? 'creating' : 'removing'
					} a punishment entry, please report this to my developers.`;
				case 'error adding role' || 'error removing role':
					return `${util.emojis.error} An error occurred while trying to ${args.action} <@&${args.role.id}> ${
						args.action === 'add' ? 'to' : 'from'
					} ${victim}.`;
				case 'success':
					return `${util.emojis.success} Successfully ${args.action === 'add' ? 'added' : 'removed'} <@&${args.role.id}> ${
						args.action === 'add' ? 'to' : 'from'
					} ${victim}${args.duration ? ` for ${util.humanizeDuration(args.duration)}` : ''}.`;
			}
		};

		await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}

	punishmentRoleNames = [
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
