import { BotCommand, emojis, format, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';

export default class DMCommand extends BotCommand {
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
					slashType: ApplicationCommandOptionType.String
				},
				{
					id: 'content',
					type: 'string',
					match: 'rest',
					description: 'The content to send to the user.',
					prompt: 'What would you like to send to the user?',
					retry: '{error} Pick something to send the user.',
					slashType: ApplicationCommandOptionType.String
				}
			],
			slash: false,
			ownerOnly: true,
			hidden: true,
			skipSendCheck: true,
			clientPermissions: [],
			userPermissions: []
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { user: ArgType<'user'>; content: ArgType<'string'> }
	) {
		try {
			await this.client.users.send(args.user.id, args.content);
		} catch (e) {
			return message.util.reply(`${emojis.error} There was an error sending ${format.input(args.user.tag)} a dm.`);
		}
		return message.util.reply(`${emojis.success} Successfully sent ${format.input(args.user.tag)} a dm.`);
	}
}
