/* eslint-disable @typescript-eslint/no-empty-function */
import { AllowedMentions, BushCommand, BushGuildMember, BushMessage, BushRole, BushSlashMessage } from '@lib';

export default class RoleCommand extends BushCommand {
	public constructor() {
		super('role', {
			aliases: ['role'],
			category: 'moderation',
			description: {
				content: "Manages users' roles.",
				usage: 'role <add|remove> <user> <role>',
				examples: ['role add tyman adminperms']
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
					description: 'The user you would like to add/remove the role from.',
					type: 'USER',
					required: true
				},
				{
					name: 'role',
					description: 'The role you would like to add/remove from the user.',
					type: 'ROLE',
					required: true
				}
			],
			channel: 'guild',
			typing: true,
			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS', 'SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES']
		});
	}

	*args(): unknown {
		const action: 'add' | 'remove' = yield {
			id: 'action',
			type: [['add'], ['remove']],
			prompt: {
				start: 'Would you like to `add` or `remove` a role?',
				retry: '{error} Choose whether you would you like to `add` or `remove` a role.'
			}
		};
		let action2: 'to' | 'from';
		if (action === 'add') action2 = 'to';
		else if (action === 'remove') action2 = 'from';
		else return;
		const user = yield {
			id: 'user',
			type: 'member',
			prompt: {
				start: `What user do you want to ${action} the role ${action2}?`,
				retry: `{error} Choose a valid user to ${action} the role ${action2}.`
			}
		};
		const role = yield {
			id: 'role',
			type: 'role',
			match: 'restContent',
			prompt: {
				start: `What role do you want to ${action}?`,
				retry: `{error} Choose a valid role to ${action}.`
			}
		};
		return { action, user, role };
	}

	public async exec(
		message: BushMessage | BushSlashMessage,
		{ action, user, role }: { action: 'add' | 'remove'; user: BushGuildMember; role: BushRole }
	): Promise<unknown> {
		if (!message.member.permissions.has('MANAGE_ROLES') && !message.author.isOwner()) {
			const mappings = this.client.consts.mappings;
			let mappedRole: { name: string; id: string };
			for (let i = 0; i < mappings.roleMap.length; i++) {
				const a = mappings.roleMap[i];
				if (a.id == role.id) mappedRole = a;
			}
			if (!mappedRole || !mappings.roleWhitelist[mappedRole.name]) {
				return await message.util.reply({
					content: `${this.client.util.emojis.error} <@&${role.id}> is not whitelisted, and you do not have manage roles permission.`,
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
					content: `${this.client.util.emojis.error} <@&${role.id}> is whitelisted, but you do not have any of the roles required to manage it.`,
					allowedMentions: AllowedMentions.none()
				});
			}
		} else if (!message.author.isOwner()) {
			if (role.comparePositionTo(message.member.roles.highest) >= 0) {
				return await message.util.reply({
					content: `${this.client.util.emojis.error} <@&${role.id}> is higher or equal to your highest role.`,
					allowedMentions: AllowedMentions.none()
				});
			}
			if (role.comparePositionTo(message.guild.me.roles.highest) >= 0) {
				return await message.util.reply({
					content: `${this.client.util.emojis.error} <@&${role.id}> is higher or equal to my highest role.`,
					allowedMentions: AllowedMentions.none()
				});
			}
			if (role.managed) {
				return await message.util.reply({
					content: `${this.client.util.emojis.error} <@&${role.id}> is managed by an integration and cannot be managed.`,
					allowedMentions: AllowedMentions.none()
				});
			}
		}
		// no checks if the user has MANAGE_ROLES
		if (action == 'remove') {
			const success = await user.roles.remove(role.id).catch(() => {});
			if (success) {
				return await message.util.reply({
					content: `${this.client.util.emojis.success} Successfully removed <@&${role.id}> from <@${user.id}>!`,
					allowedMentions: AllowedMentions.none()
				});
			} else {
				return await message.util.reply({
					content: `${this.client.util.emojis.error} Could not remove <@&${role.id}> from <@${user.id}>.`,
					allowedMentions: AllowedMentions.none()
				});
			}
		} else if (action == 'add') {
			const success = await user.roles.add(role.id).catch(() => {});
			if (success) {
				return await message.util.reply({
					content: `${this.client.util.emojis.success} Successfully added <@&${role.id}> to <@${user.id}>!`,
					allowedMentions: AllowedMentions.none()
				});
			} else {
				return await message.util.reply({
					content: `${this.client.util.emojis.error} Could not add <@&${role.id}> to <@${user.id}>.`,
					allowedMentions: AllowedMentions.none()
				});
			}
		}
	}
}
