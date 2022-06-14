import { AllowedMentions, BushCommand, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';

export default class SayCommand extends BushCommand {
	public constructor() {
		super('say', {
			aliases: ['say'],
			category: 'dev',
			description: 'A command make the bot say something.',
			usage: ['say <content>'],
			examples: ['say hello'],
			args: [
				{
					id: 'content',
					description: 'The content of the message to send.',
					type: 'string',
					match: 'rest',
					prompt: 'What would you like the bot to say?',
					retry: '{error} Choose something for the bot to send.',
					slashType: ApplicationCommandOptionType.String
				}
			],
			ownerOnly: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: [],
			slash: true
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { content: ArgType<'string'> }) {
		if (!message.author.isOwner())
			return await message.util.reply(`${util.emojis.error} Only my developers can run this command.`);

		await message.delete().catch(() => null);
		await message.util.send({ content: args.content, allowedMentions: AllowedMentions.none() }).catch(() => null);
	}

	public override async execSlash(message: SlashMessage, args: { content: string }) {
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
