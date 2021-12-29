import { AllowedMentions, BushCommand, type ArgType, type BushMessage, type BushSlashMessage, type OptionalArgType } from '#lib';

export default class UnbanCommand extends BushCommand {
	public constructor() {
		super('unban', {
			aliases: ['unban'],
			category: 'moderation',
			description: 'Unban a member from the server.',
			usage: ['unban <member> <reason>'],
			examples: ['unban 322862723090219008 I changed my mind, commands are allowed in #general'],
			args: [
				{
					id: 'user',
					description: 'The user to unban.',
					type: 'globalUser',
					prompt: 'What user would you like to unban?',
					retry: '{error} Choose a valid user to unban.',
					slashType: 'USER'
				},
				{
					id: 'reason',
					description: 'The reason for the unban',
					type: 'string',
					match: 'restContent',
					prompt: 'Why should this user be unbanned?',
					retry: '{error} Choose a valid unban reason.',
					optional: true,
					slashType: 'STRING'
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS']
		});
	}
	public override async exec(
		message: BushMessage | BushSlashMessage,
		{ user, reason }: { user: ArgType<'user'>; reason: OptionalArgType<'string'> }
	) {
		const responseCode = await message.guild!.bushUnban({
			user,
			moderator: message.author,
			reason
		});

		const responseMessage = () => {
			const victim = util.format.input(user.tag);
			switch (responseCode) {
				case 'missing permissions':
					return `${util.emojis.error} Could not unban ${victim} because I am missing the **Ban Members** permission.`;
				case 'error unbanning':
					return `${util.emojis.error} An error occurred while trying to unban ${victim}.`;
				case 'error removing ban entry':
					return `${util.emojis.error} While unbanning ${victim}, there was an error removing their ban entry, please report this to my developers.`;
				case 'error creating modlog entry':
					return `${util.emojis.error} While unbanning ${victim}, there was an error creating a modlog entry, please report this to my developers.`;
				case 'user not banned':
					return `${util.emojis.warn} ${victim} is not banned but I tried to unban them anyways.`;
				case 'success':
					return `${util.emojis.success} Successfully unbanned ${victim}.`;
			}
		};
		return await message.util.reply({ content: responseMessage(), allowedMentions: AllowedMentions.none() });
	}
}
