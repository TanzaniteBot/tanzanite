import { AllowedMentions, BushCommand, BushMessage, BushSlashMessage, BushUser } from '@lib';
import { User } from 'discord.js';

export default class UnbanCommand extends BushCommand {
	public constructor() {
		super('unban', {
			aliases: ['unban'],
			category: 'moderation',
			description: {
				content: 'Unban a member from the server.',
				usage: 'unban <member> <reason> [--delete ]',
				examples: ['unban 322862723090219008 I changed my mind, commands are allowed in #general']
			},
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to unban?',
						retry: '{error} Choose a valid user to unban.'
					}
				},
				{
					id: 'reason',
					type: 'string',
					match: 'restContent',
					prompt: {
						start: 'Why should this user be unbanned?',
						retry: '{error} Choose a valid unban reason.',
						optional: true
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'user',
					description: 'What user would you like to unban?',
					type: 'USER',
					required: true
				},
				{
					name: 'reason',
					description: 'Why should this user be unbanned?',
					type: 'STRING',
					required: false
				}
			],
			channel: 'guild',
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS']
		});
	}
	override async exec(
		message: BushMessage | BushSlashMessage,
		{ user, reason }: { user: BushUser; reason?: string }
	): Promise<unknown> {
		if (!(user instanceof User)) {
			user = util.resolveUser(user, client.users.cache) as BushUser;
		}
		const responseCode = await message.guild.unban({
			user,
			moderator: message.author,
			reason
		});

		const responseMessage = () => {
			switch (responseCode) {
				case 'missing permissions':
					return `${util.emojis.error} Could not unban **${user.tag}** because I do not have permissions`;
				case 'error unbanning':
					return `${util.emojis.error} An error occurred while trying to unban **${user.tag}**.`;
				case 'error removing ban entry':
					return `${util.emojis.error} While unbanning **${user.tag}**, there was an error removing their ban entry, please report this to my developers.`;
				case 'error creating modlog entry':
					return `${util.emojis.error} While unbanning **${user.tag}**, there was an error creating a modlog entry, please report this to my developers.`;
				case 'user not banned':
					return `${util.emojis.warn} **${user.tag}** but I tried to unban them anyways.`;
				case 'success':
					return `${util.emojis.success} Successfully unbanned **${user.tag}**.`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
