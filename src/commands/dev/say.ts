import { AllowedMentions, BushCommand, BushMessage } from '@lib';
import { AkairoMessage } from 'discord-akairo';

export default class SayCommand extends BushCommand {
	public constructor() {
		super('say', {
			aliases: ['say'],
			category: 'dev',
			description: {
				content: 'A command make the bot say something.',
				usage: ['say <message>'],
				examples: ['say hello']
			},
			args: [
				{
					id: 'content',
					type: 'string',
					match: 'rest',
					prompt: { start: 'What would you like the bot to say?', retry: '{error} Choose something valid to say.' }
				}
			],
			slashOptions: [{ name: 'content', description: 'What would you like the bot to say?', type: 'STRING' }],
			ownerOnly: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: [],
			slash: true
		});
	}

	public override async exec(message: BushMessage, args: { content: string }) {
		if (!message.author.isOwner())
			return await message.util.reply(`${util.emojis.error} Only my developers can run this command.`);

		await message.delete().catch(() => null);
		await message.util.send({ content: args.content, allowedMentions: AllowedMentions.none() }).catch(() => null);
	}

	public override async execSlash(message: AkairoMessage, args: { content: string }) {
		if (!client.config.owners.includes(message.author.id)) {
			return await message.interaction.reply({
				content: `${util.emojis.error} Only my developers can run this command.`,
				ephemeral: true
			});
		}
		await message.interaction.reply({ content: 'Attempting to send message.', ephemeral: true });
		return message.channel!.send({ content: args.content, allowedMentions: AllowedMentions.none() }).catch(() => null);
	}
}
