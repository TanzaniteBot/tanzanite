/* eslint-disable @typescript-eslint/no-empty-function */
import { BotCommand } from '../../lib/extensions/BotCommand';
import AllowedMentions from '../../lib/utils/AllowedMentions';
import { Message, Role, GuildMember } from 'discord.js';

export default class RoleCommand extends BotCommand {
	private roleWhitelist: Record<string, string[]> = {
		'Partner': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Suggester': [
			'*',
			'Admin Perms',
			'Sr. Moderator',
			'Moderator',
			'Helper',
			'Trial Helper',
			'Contributor'
		],
		'Level Locked': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No Files': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No Reactions': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No Links': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No Bots': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No VC': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No Giveaways': [
			'*',
			'Admin Perms',
			'Sr. Moderator',
			'Moderator',
			'Helper'
		],
		'No Support': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Giveaway Donor': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Giveaway (200m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Giveaway (100m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Giveaway (50m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Giveaway (25m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Giveaway (10m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Giveaway (5m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Giveaway (1m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator']
	};
	constructor() {
		super('role', {
			aliases: ['role', 'addrole', 'removerole'],
			category: "Moulberry's Bush",
			description: {
				content: "Manages users' roles.",
				usage: 'role <add|remove> <user> <role>',
				examples: ['role add tyman adminperms']
			},
			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS', 'SEND_MESSAGES'],
			channel: 'guild',
			typing: true
		});
	}
	*args(): unknown {
		const action: 'add' | 'remove' = yield {
			id: 'action',
			type: [['add'], ['remove']],
			prompt: {
				start: 'Would you like to `add` or `remove` a role?',
				retry:
					'<:error:837123021016924261> Choose whether you would you like to `add` or `remove` a role.'
			}
		};
		let actionWord: string;
		if (action === 'add') actionWord = 'to';
		else if (action === 'remove') actionWord = 'from';
		else return;
		const user = yield {
			id: 'user',
			type: 'member',
			prompt: {
				start: `What user do you want to ${action} the role ${actionWord}?`,
				retry: `<:error:837123021016924261> Choose a valid user to ${action} the role ${actionWord}.`
			}
		};
		const role = yield {
			id: 'role',
			type: 'role',
			match: 'restContent',
			prompt: {
				start: `What role do you want to ${action}?`,
				retry: `<:error:837123021016924261> Choose a valid role to ${action}.`
			}
		};
		return { action, user, role };
	}

	// eslint-disable-next-line require-await
	public async exec(
		message: Message,
		{
			action,
			user,
			role
		}: { action: 'add' | 'remove'; user: GuildMember; role: Role }
	): Promise<unknown> {
		if (
			!message.member.permissions.has('MANAGE_ROLES') &&
			!this.client.ownerID.includes(message.author.id)
		) {
			const mappedRole = this.client.util.moulberryBushRoleMap.find(
				(m) => m.id === role.id
			);
			if (!mappedRole || !this.roleWhitelist[mappedRole.name]) {
				return message.util.reply(
					`<:error:837123021016924261> <@&${role.id}> is not whitelisted, and you do not have manage roles permission.`,
					{
						allowedMentions: AllowedMentions.none()
					}
				);
			}
			const allowedRoles = this.roleWhitelist[mappedRole.name].map((r) => {
				return this.client.util.moulberryBushRoleMap.find((m) => m.name === r)
					.id;
			});
			if (
				!message.member.roles.cache.some((role) =>
					allowedRoles.includes(role.id)
				)
			) {
				return message.util.reply(
					`<:error:837123021016924261> <@&${role.id}> is whitelisted, but you do not have any of the roles required to manage it.`,
					{
						allowedMentions: AllowedMentions.none()
					}
				);
			}
		}
		if (!this.client.ownerID.includes(message.author.id)) {
			if (role.comparePositionTo(message.member.roles.highest) >= 0) {
				return message.util.reply(
					`<:error:837123021016924261> <@&${role.id}> is higher or equal to your highest role.`,
					{
						allowedMentions: AllowedMentions.none()
					}
				);
			}
			if (role.comparePositionTo(message.guild.me.roles.highest) >= 0) {
				return message.util.reply(
					`<:error:837123021016924261> <@&${role.id}> is higher or equal to my highest role.`,
					{
						allowedMentions: AllowedMentions.none()
					}
				);
			}
			if (role.managed) {
				await message.util.reply(
					`<:error:837123021016924261> <@&${role.id}> is managed by an integration and cannot be managed.`,
					{
						allowedMentions: AllowedMentions.none()
					}
				);
			}
		}
		// no checks if the user has MANAGE_ROLES
		if (action == 'remove') {
			const success = await user.roles.remove(role.id).catch(() => undefined);
			if (success)
				return message.util.reply(
					`<:checkmark:837109864101707807> Successfully removed <@&${role.id}> from <@${user.id}>!`,
					{ allowedMentions: AllowedMentions.none() }
				);
			else
				return message.util.reply(
					`<:error:837123021016924261> Could not remove <@&${role.id}> from <@${user.id}>.`,
					{ allowedMentions: AllowedMentions.none() }
				);
		} else if (action == 'add') {
			const success = await user.roles.add(role.id).catch(() => undefined);
			if (success) {
				return message.util.reply(
					`<:checkmark:837109864101707807> Successfully added <@&${role.id}> to <@${user.id}>!`,
					{ allowedMentions: AllowedMentions.none() }
				);
			} else
				return message.util.reply(
					`<:error:837123021016924261> Could not add <@&${role.id}> to <@${user.id}>.`,
					{ allowedMentions: AllowedMentions.none() }
				);
		}
	}
}
