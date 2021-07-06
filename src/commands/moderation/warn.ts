import { BushCommand, BushGuildMember, BushMessage, BushSlashMessage, BushUser } from '../../lib';

export default class WarnCommand extends BushCommand {
	public constructor() {
		super('warn', {
			aliases: ['warn'],
			category: 'moderation',
			description: {
				content: 'Warn a user.',
				usage: 'warn <member> [reason]',
				examples: ['warn @Tyman being cool']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to warn?',
						retry: '{error} Choose a valid user to warn.'
					}
				},
				{
					id: 'reason',
					type: 'content',
					match: 'rest',
					prompt: {
						start: 'Why should this user be warned?',
						retry: '{error} Choose a valid warn reason.',
						optional: true
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					type: 'USER',
					name: 'user',
					description: 'What user would you like to warn?',
					required: true
				},
				{
					type: 'STRING',
					name: 'reason',
					description: 'Why should this user be warned?',
					required: false
				}
			],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['MANAGE_MESSAGES']
		});
	}
	public async exec(
		message: BushMessage | BushSlashMessage,
		{ user, reason }: { user: BushUser; reason: string }
	): Promise<unknown> {
		const member = message.guild.members.cache.get(user.id) as BushGuildMember;
		const canModerateResponse = this.client.util.moderationPermissionCheck(message.member, member, 'warn');
		const victimBoldTag = `**${member.user.tag}**`;

		if (typeof canModerateResponse !== 'boolean') {
			return message.util.reply(canModerateResponse);
		}

		const { result: response, caseNum } = await member.warn({
			reason,
			moderator: message.author
		});

		switch (response) {
			case 'error creating modlog entry':
				return message.util.reply(
					`${this.client.util.emojis.error} While warning ${victimBoldTag}, there was an error creating a modlog entry, please report this to my developers.`
				);
			case 'failed to dm':
				return message.util.reply(
					`${this.client.util.emojis.warn} **${member.user.tag}** has been warned for the ${this.client.util.ordinal(
						caseNum
					)} time, however I could not send them a dm.`
				);
			case 'success':
				return message.util.reply(
					`${this.client.util.emojis.success} Successfully warned **${member.user.tag}** for the ${this.client.util.ordinal(
						caseNum
					)} time.`
				);
		}
	}
}
