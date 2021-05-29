/* eslint-disable @typescript-eslint/no-empty-function */
import { BushCommand } from '../../lib/extensions/BushCommand';
import AllowedMentions from '../../lib/utils/AllowedMentions';
import { Message, Role, GuildMember } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord-api-types';

export default class RoleCommand extends BushCommand {
	private roleWhitelist: Record<string, string[]> = {
		'Partner': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Suggester': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator', 'Helper', 'Trial Helper', 'Contributor'],
		'Level Locked': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No Files': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No Reactions': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No Links': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No Bots': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No VC': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No Giveaways': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator', 'Helper'],
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
			category: 'moderation',
			description: {
				content: "Manages users' roles.",
				usage: 'role <add|remove> <user> <role>',
				examples: ['role add tyman adminperms']
			},
			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS', 'SEND_MESSAGES'],
			channel: 'guild',
			typing: true,
			args: [
				{
					id: 'user',
					type: 'member',
					prompt: {
						start: `What user do you want to add/remove the role on?`,
						retry: `<:error:837123021016924261> Choose a valid user to add/remove the role on.`
					}
				},
				{
					id: 'role',
					type: 'role',
					match: 'restContent',
					prompt: {
						start: `What role do you want to add/remove?`,
						retry: `<:error:837123021016924261> Choose a valid role to add/remove.`
					}
				}
			],
			slashCommandOptions: [
				{
					type: ApplicationCommandOptionType.USER,
					name: 'user',
					description: 'The user to add/remove the role on',
					required: true
				},
				{
					type: ApplicationCommandOptionType.ROLE,
					name: 'role',
					description: 'The role to add/remove',
					required: true
				}
			]
		});
	}

	public async exec(message: Message, { user, role }: { user: GuildMember; role: Role }): Promise<unknown> {
		if (!message.member.permissions.has('MANAGE_ROLES') && !this.client.ownerID.includes(message.author.id)) {
			const mappedRole = this.client.util.moulberryBushRoleMap.find((m) => m.id === role.id);
			if (!mappedRole || !this.roleWhitelist[mappedRole.name]) {
				return message.util.reply(
					`<:error:837123021016924261> <@&${role.id}> is not whitelisted, and you do not have manage roles permission.`,
					{
						allowedMentions: AllowedMentions.none()
					}
				);
			}
			const allowedRoles = this.roleWhitelist[mappedRole.name].map((r) => {
				return this.client.util.moulberryBushRoleMap.find((m) => m.name === r).id;
			});
			if (!message.member.roles.cache.some((role) => allowedRoles.includes(role.id))) {
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
				return message.util.reply(`<:error:837123021016924261> <@&${role.id}> is higher or equal to your highest role.`, {
					allowedMentions: AllowedMentions.none()
				});
			}
			if (role.comparePositionTo(message.guild.me.roles.highest) >= 0) {
				return message.util.reply(`<:error:837123021016924261> <@&${role.id}> is higher or equal to my highest role.`, {
					allowedMentions: AllowedMentions.none()
				});
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
		// No checks if the user has MANAGE_ROLES
		if (user.roles.cache.has(role.id)) {
			try {
				await user.roles.remove(role.id);
			} catch {
				return message.util.reply(`<:error:837123021016924261> Could not remove <@&${role.id}> from <@${user.id}>.`, {
					allowedMentions: AllowedMentions.none()
				});
			}
			return message.util.reply(`<:checkmark:837109864101707807> Successfully removed <@&${role.id}> from <@${user.id}>!`, {
				allowedMentions: AllowedMentions.none()
			});
		} else {
			try {
				await user.roles.add(role.id);
			} catch {
				return message.util.reply(`<:error:837123021016924261> Could not add <@&${role.id}> to <@${user.id}>.`, {
					allowedMentions: AllowedMentions.none()
				});
			}
			return message.util.reply(`<:checkmark:837109864101707807> Successfully added <@&${role.id}> to <@${user.id}>!`, {
				allowedMentions: AllowedMentions.none()
			});
		}
	}
}
