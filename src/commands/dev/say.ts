import { AllowedMentions, BushCommand, BushMessage } from '@lib';
import { AkairoMessage } from 'discord-akairo';

export default class SayCommand extends BushCommand {
	public constructor() {
		super('say', {
			aliases: ['say'],
			category: 'dev',
			description: {
				content: 'A command make the bot say something.',
				usage: 'say <message>',
				examples: ['say hello']
			},
			args: [
				{
					id: 'say',
					type: 'string',
					match: 'rest',
					prompt: { start: 'What would you like the bot to say?', retry: '{error} Choose something valid to say.' }
				}
			],
			slashOptions: [{ name: 'content', description: 'What would you like the bot to say?', type: 'STRING' }],
			ownerOnly: true,
			clientPermissions: ['SEND_MESSAGES'],
			slash: true
		});
	}

	public override async exec(message: BushMessage, { say }: { say: string }): Promise<unknown> {
		if (!message.author.isOwner())
			return await message.util.reply(`${util.emojis.error} Only my developers can run this command.`);

		await message.delete().catch(() => {});
		await message.util.send({ content: say, allowedMentions: AllowedMentions.none() });
	}

	public override async execSlash(message: AkairoMessage, { content }: { content: string }): Promise<unknown> {
		if (!client.config.owners.includes(message.author.id)) {
			return await message.interaction.reply({
				content: `${util.emojis.error} Only my developers can run this command.`,
				ephemeral: true
			});
		}
		await message.interaction.reply({ content: 'Attempting to send message.', ephemeral: true });
		return message.channel!.send({ content, allowedMentions: AllowedMentions.none() });
	}
}
