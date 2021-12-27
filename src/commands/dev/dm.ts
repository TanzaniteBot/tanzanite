import { ArgType, BushCommand, type BushMessage, type BushSlashMessage } from '#lib';

export default class DMCommand extends BushCommand {
	public constructor() {
		super('dm', {
			aliases: ['dm'],
			category: 'dev',
			description: 'Send a direct message to a specified user from the bot.',
			usage: ['dm <user> <content>'],
			examples: ['dm IRONM00N hi'],
			args: [
				{
					id: 'user',
					type: 'user',
					description: 'The user to send the dm to.',
					prompt: 'Who would you like to dm?',
					retry: '{error} Pick a valid user to send a dm to.',
					slashType: 'STRING'
				},
				{
					id: 'content',
					type: 'string',
					match: 'rest',
					description: 'This is the second argument.',
					prompt: 'What would you like to set your second argument to be?',
					retry: '{error} Pick a valid argument.',
					optional: true,
					slashType: 'STRING'
				}
			],
			slash: false,
			ownerOnly: true,
			hidden: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}
	public override async exec(message: BushMessage | BushSlashMessage, args: { user: ArgType<'user'>; content: string }) {
		try {
			const u = await client.users.fetch(args.user.id);
			await u.send(args.content);
		} catch (e) {
			return message.util.reply(`${util.emojis.error} There was an error sending ${util.format.input(args.user.tag)} a dm.`);
		}
		return message.util.reply(`${util.emojis.success} Successfully sent ${util.format.input(args.user.tag)} a dm.`);
	}
}
