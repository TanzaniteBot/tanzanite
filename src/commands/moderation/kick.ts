import { BushCommand, BushGuildMember, BushMessage, BushSlashMessage, BushUser } from '@lib';

export default class KickCommand extends BushCommand {
	public constructor() {
		super('kick', {
			aliases: ['kick'],
			category: 'moderation',
			description: {
				content: 'Kick a user.',
				usage: 'kick <member> <reason>',
				examples: ['kick @user bad']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to kick?',
						retry: '{error} Choose a valid user to kick.'
					}
				},
				{
					id: 'reason',
					type: 'string',
					match: 'restContent',
					prompt: {
						start: 'Why should this user be kicked?',
						retry: '{error} Choose a valid kick reason.',
						optional: true
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					type: 'USER',
					name: 'user',
					description: 'What user would you like to kick?',
					required: true
				},
				{
					type: 'STRING',
					name: 'reason',
					description: 'Why should this user be kicked?',
					required: false
				}
			],
			clientPermissions: ['SEND_MESSAGES', 'KICK_MEMBERS'],
			userPermissions: ['KICK_MEMBERS']
		});
	}

	async exec(message: BushMessage | BushSlashMessage, { user, reason }: { user: BushUser; reason?: string }): Promise<unknown> {
		const member = message.guild.members.cache.get(user.id) as BushGuildMember;
		const canModerateResponse = this.client.util.moderationPermissionCheck(message.member, member, 'kick');
		// const victimBoldTag = `**${member.user.tag}**`;

		if (typeof canModerateResponse !== 'boolean') {
			return message.util.reply(canModerateResponse);
		}

		const response = await member.bushKick({
			reason,
			moderator: message.author
		});
	}
}
