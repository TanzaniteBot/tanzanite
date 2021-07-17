import { AllowedMentions, BushCommand, BushGuildMember, BushMessage, BushSlashMessage, BushUser } from '@lib';

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
					match: 'rest',
					prompt: {
						start: 'Why should this user be kicked?',
						retry: '{error} Choose a valid kick reason.',
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
					description: 'What user would you like to kick?',
					type: 'USER',
					required: true
				},
				{
					name: 'reason',
					description: 'Why should this user be kicked?',
					type: 'STRING',
					required: false
				}
			],
			clientPermissions: ['SEND_MESSAGES', 'KICK_MEMBERS'],
			userPermissions: ['KICK_MEMBERS']
		});
	}

	async exec(
		message: BushMessage | BushSlashMessage,
		{ user, reason, force }: { user: BushUser; reason?: string; force: boolean }
	): Promise<unknown> {
		const member = message.guild.members.cache.get(user.id) as BushGuildMember;
		const useForce = force && message.author.isOwner();
		const canModerateResponse = this.client.util.moderationPermissionCheck(message.member, member, 'kick', true, useForce);

		if (canModerateResponse !== true) {
			return message.util.reply(canModerateResponse);
		}

		const responseCode = await member.bushKick({
			reason,
			moderator: message.author
		});

		const responseMessage = () => {
			switch (responseCode) {
				case 'missing permissions':
					return `${this.client.util.emojis.error} Could not kick **${member.user.tag}** because I am missing the \`Kick Members\` permission.`;
				case 'error kicking':
					return `${this.client.util.emojis.error} An error occurred while trying to kick **${member.user.tag}**.`;
				case 'error creating modlog entry':
					return `${this.client.util.emojis.error} While muting **${member.user.tag}**, there was an error creating a modlog entry, please report this to my developers.`;
				case 'failed to dm':
					return `${this.client.util.emojis.warn} Kicked **${member.user.tag}** however I could not send them a dm.`;
				case 'success':
					return `${this.client.util.emojis.success} Successfully kicked **${member.user.tag}**.`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
