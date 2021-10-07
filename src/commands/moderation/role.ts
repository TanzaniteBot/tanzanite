import { AllowedMentions, BushCommand, BushGuildMember, BushMessage, BushRole, BushSlashMessage } from '@lib';
import { ArgumentOptions, Flag } from 'discord-akairo';

export default class RoleCommand extends BushCommand {
	public constructor() {
		super('role', {
			aliases: ['role', 'rr', 'ar', 'ra'],
			category: 'moderation',
			description: {
				content: "Manages users' roles.",
				usage: 'role <add|remove> <user> <role> [duration]',
				examples: ['role add spammer nogiveaways 7days', 'ra tyman muted', 'rr tyman staff']
			},
			slash: true,
			slashOptions: [
				{
					name: 'action',
					description: 'Would you like to add or remove a role?',
					type: 'STRING',
					choices: [
						{
							name: 'add',
							value: 'add'
						},
						{
							name: 'remove',
							value: 'remove'
						}
					],
					required: true
				},
				{
					name: 'user',
					description: 'What user do you want to add/remove the role to/from?',
					type: 'USER',
					required: true
				},
				{
					name: 'role',
					description: 'The role you would like to add/remove from the to/from.',
					type: 'ROLE',
					required: true
				},
				{
					name: 'duration',
					description: 'How long would you like to role to last?',
					type: 'STRING',
					required: false
				}
			],
			channel: 'guild',
			typing: true,
			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS', 'SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES']
		});
	}

	override *args(message: BushMessage): IterableIterator<ArgumentOptions | Flag> {
		const action = ['rr'].includes(message.util.parsed?.alias ?? '')
			? 'remove'
			: ['ar', 'ra'].includes(message.util.parsed?.alias ?? '')
			? 'add'
			: yield {
					id: 'action',
					type: [['add'], ['remove']],
					prompt: {
						start: 'Would you like to `add` or `remove` a role?',
						retry: '{error} Choose whether you would you like to `add` or `remove` a role.'
					}
			  };

		const user = yield {
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

		return { action, user, role: (_role as any).role ?? _role, duration: (_role as any).duration };
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		{
			action,
			user,
			role,
			duration
		}: { action: 'add' | 'remove'; user: BushGuildMember; role: BushRole; duration?: number | null }
	): Promise<unknown> {
		if (duration === null) duration = 0;
		if (
			!message.member!.permissions.has('MANAGE_ROLES') &&
			message.member!.id !== message.guild?.ownerId &&
			!message.member!.user.isOwner()
		) {
			const mappings = client.consts.mappings;
			let mappedRole: { name: string; id: string };
			for (let i = 0; i < mappings.roleMap.length; i++) {
				const a = mappings.roleMap[i];
				if (a.id == role.id) mappedRole = a;
			}
			if (!mappedRole! || !mappings.roleWhitelist[mappedRole.name as keyof typeof mappings.roleWhitelist]) {
				return await message.util.reply({
					content: `${util.emojis.error} <@&${role.id}> is not whitelisted, and you do not have manage roles permission.`,
					allowedMentions: AllowedMentions.none()
				});
			}
			const allowedRoles = mappings.roleWhitelist[mappedRole.name as keyof typeof mappings.roleWhitelist].map((r) => {
				for (let i = 0; i < mappings.roleMap.length; i++) {
					if (mappings.roleMap[i].name == r) return mappings.roleMap[i].id;
				}
				return;
			});
			if (!message.member!.roles.cache.some((role) => allowedRoles.includes(role.id))) {
				return await message.util.reply({
					content: `${util.emojis.error} <@&${role.id}> is whitelisted, but you do not have any of the roles required to manage it.`,
					allowedMentions: AllowedMentions.none()
				});
			}
		}

		const shouldLog = this.punishmentRoleNames.includes(role.name);

		const responseCode =
			action === 'add'
				? await user.addRole({ moderator: message.member!, addToModlog: shouldLog, role, duration })
				: await user.removeRole({ moderator: message.member!, addToModlog: shouldLog, role, duration });

		const responseMessage = () => {
			switch (responseCode) {
				case 'user hierarchy':
					return `${util.emojis.error} <@&${role.id}> is higher or equal to your highest role.`;
				case 'role managed':
					return `${util.emojis.error} <@&${role.id}> is managed by an integration and cannot be managed.`;
				case 'client hierarchy':
					return `${util.emojis.error} <@&${role.id}> is higher or equal to my highest role.`;
				case 'error creating modlog entry':
					return `${util.emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
				case 'error creating role entry' || 'error removing role entry':
					return `${util.emojis.error} There was an error ${
						action === 'add' ? 'creating' : 'removing'
					} a punishment entry, please report this to my developers.`;
				case 'error adding role' || 'error removing role':
					return `${util.emojis.error} An error occurred while trying to ${action} <@&${role.id}> ${
						action === 'add' ? 'to' : 'from'
					} **${user.user.tag}**.`;
				case 'success':
					return `${util.emojis.success} Successfully ${action === 'add' ? 'added' : 'removed'} <@&${role.id}> ${
						action === 'add' ? 'to' : 'from'
					} **${user.user.tag}**${duration ? ` for ${util.humanizeDuration(duration)}` : ''}.`;
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
