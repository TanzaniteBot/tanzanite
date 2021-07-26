import { BushCommand, BushGuildMember, BushMessage, BushSlashMessage, BushUser } from '@lib';

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
				},
				{
					id: 'force',
					flag: '--force',
					match: 'flag'
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'user',
					description: 'What user would you like to warn?',
					type: 'USER',
					required: true
				},
				{
					name: 'reason',
					description: 'Why should this user be warned?',
					type: 'STRING',
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
		{ user, reason, force }: { user: BushUser; reason: string; force: boolean }
	): Promise<unknown> {
		const member = message.guild.members.cache.get(user.id) as BushGuildMember;
		const useForce = force && message.author.isOwner();
		const canModerateResponse = util.moderationPermissionCheck(message.member, member, 'warn', true, useForce);
		const victimBoldTag = `**${member.user.tag}**`;

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const { result: response, caseNum } = await member.warn({
			reason,
			moderator: message.author
		});

		switch (response) {
			case 'error creating modlog entry':
				return message.util.reply(
					`${util.emojis.error} While warning ${victimBoldTag}, there was an error creating a modlog entry, please report this to my developers.`
				);
			case 'failed to dm':
				return message.util.reply(
					`${util.emojis.warn} **${member.user.tag}** has been warned for the ${util.ordinal(
						caseNum
					)} time, however I could not send them a dm.`
				);
			case 'success':
				return message.util.reply(
					`${util.emojis.success} Successfully warned **${member.user.tag}** for the ${util.ordinal(caseNum)} time.`
				);
		}
	}
}
