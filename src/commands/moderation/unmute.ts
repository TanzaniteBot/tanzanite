import { BushCommand, BushGuildMember, BushMessage, BushSlashMessage, BushUser } from '@lib';

export default class UnmuteCommand extends BushCommand {
	public constructor() {
		super('unmute', {
			aliases: ['unmute'],
			category: 'moderation',
			description: {
				content: 'unmute a user.',
				usage: 'unmute <member> [reason] [duration]',
				examples: ['unmute 322862723090219008 1 day commands in #general']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to unmute?',
						retry: '{error} Choose a valid user to unmute.'
					}
				},
				{
					id: 'reason',
					type: 'string',
					match: 'rest',
					prompt: {
						start: 'Why should this user be unmuted?',
						retry: '{error} Choose a valid unmute reason.',
						optional: true
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'user',
					description: 'What user would you like to unmute?',
					type: 'USER',
					required: true
				},
				{
					name: 'reason',
					description: 'Why should this user be unmuted?',
					type: 'STRING',
					required: false
				}
			],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES', 'MANAGE_ROLES'],
			userPermissions: ['MANAGE_MESSAGES']
		});
	}
	async exec(message: BushMessage | BushSlashMessage, { user, reason }: { user: BushUser; reason?: string }): Promise<unknown> {
		const error = this.client.util.emojis.error;
		const member = message.guild.members.cache.get(user.id) as BushGuildMember;
		const canModerateResponse = this.client.util.moderationPermissionCheck(message.member, member, 'unmute');
		const victimBoldTag = `**${member.user.tag}**`;

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const response = await member.unmute({
			reason,
			moderator: message.author
		});

		switch (response) {
			case 'missing permissions':
				return message.util.reply(
					`${error} Could not unmute ${victimBoldTag} because I am missing the \`Manage Roles\` permission.`
				);
			case 'no mute role':
				return message.util.reply(
					`${error} Could not unmute ${victimBoldTag}, you must set a mute role with \`${message.guild.getSetting(
						'prefix'
					)}muterole\`.`
				);
			case 'invalid mute role':
				return message.util.reply(
					`${error} Could not unmute ${victimBoldTag} because the current mute role no longer exists. Please set a new mute role with \`${message.guild.getSetting(
						'prefix'
					)}muterole\`.`
				);
			case 'mute role not manageable':
				return message.util.reply(
					`${error} Could not unmute ${victimBoldTag} because I cannot assign the current mute role, either change the role's position or set a new mute role with \`${message.guild.getSetting(
						'prefix'
					)}muterole\`.`
				);
			case 'error removing mute role':
				return message.util.reply(`${error} Could not unmute ${victimBoldTag}, there was an error removing their mute role.`);
			case 'error creating modlog entry':
				return message.util.reply(
					`${error} While muting ${victimBoldTag}, there was an error creating a modlog entry, please report this to my developers.`
				);
			case 'error removing mute entry':
				return message.util.reply(
					`${error} While muting ${victimBoldTag}, there was an error removing their mute entry, please report this to my developers.`
				);
			case 'failed to dm':
				return message.util.reply(
					`${this.client.util.emojis.warn} unmuted **${member.user.tag}** however I could not send them a dm.`
				);
			case 'success':
				return message.util.reply(`${this.client.util.emojis.success} Successfully unmuted **${member.user.tag}**.`);
		}
	}
}
