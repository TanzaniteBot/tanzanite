/* eslint-disable @typescript-eslint/no-empty-function */
import { AllowedMentions, BushCommand, BushGuildMember, BushMessage, BushRole, BushSlashMessage } from '@lib';

export default class RoleCommand extends BushCommand {
	public constructor() {
		super('role', {
			aliases: ['role'],
			category: 'moderation',
			description: {
				content: "Manages users' roles.",
				usage: 'role <add|remove> <user> <role> [duration]',
				examples: ['role add spammer nogiveaways 7days']
			},
			args: [
				{
					id: 'action',
					type: [['add'], ['remove']],
					prompt: {
						start: 'Would you like to `add` or `remove` a role?',
						retry: '{error} Choose whether you would you like to `add` or `remove` a role.'
					}
				},
				{
					id: 'user',
					type: 'member',
					prompt: {
						start: `What user do you want to add/remove the role to/from?`,
						retry: `{error} Choose a valid user to add/remove the role to/from.`
					}
				},
				{
					id: 'role',
					type: 'role',
					prompt: {
						start: `What role do you want to add/remove to/from the user.?`,
						retry: `{error} Choose a valid role to add/remove.`
					}
				},
				{
					id: 'duration',
					type: 'duration',
					prompt: {
						start: 'How long would you like to role to last?',
						retry: '{error} Choose a valid duration.',
						optional: true
					}
				}
			],
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

	public async exec(
		message: BushMessage | BushSlashMessage,
		{ action, user, role, duration }: { action: 'add' | 'remove'; user: BushGuildMember; role: BushRole; duration: number }
	): Promise<unknown> {
		if (!message.member.permissions.has('MANAGE_ROLES')) {
			const mappings = this.client.consts.mappings;
			let mappedRole: { name: string; id: string };
			for (let i = 0; i < mappings.roleMap.length; i++) {
				const a = mappings.roleMap[i];
				if (a.id == role.id) mappedRole = a;
			}
			if (!mappedRole || !mappings.roleWhitelist[mappedRole.name]) {
				return await message.util.reply({
					content: `${util.emojis.error} <@&${role.id}> is not whitelisted, and you do not have manage roles permission.`,
					allowedMentions: AllowedMentions.none()
				});
			}
			const allowedRoles = mappings.roleWhitelist[mappedRole.name].map((r) => {
				for (let i = 0; i < mappings.roleMap.length; i++) {
					if (mappings.roleMap[i].name == r) return mappings.roleMap[i].id;
				}
				return;
			});
			if (!message.member.roles.cache.some((role) => allowedRoles.includes(role.id))) {
				return await message.util.reply({
					content: `${util.emojis.error} <@&${role.id}> is whitelisted, but you do not have any of the roles required to manage it.`,
					allowedMentions: AllowedMentions.none()
				});
			}
		}

		const shouldLog = this.punishmentRoleNames.includes(role.name);

		const responseCode =
			action === 'add'
				? await user.addRole({ moderator: message.member, addToModlog: shouldLog, role, duration })
				: await user.removeRole({ moderator: message.member, addToModlog: shouldLog, role, duration });

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
		'No Reactions',
		'No Suggestions',
		'No Bots',
		'No VC',
		'No Giveaways',
		'No Support'
	];
}
