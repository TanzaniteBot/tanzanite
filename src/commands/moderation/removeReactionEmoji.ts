import { Arg, BotCommand, emojis, format, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import assert from 'assert/strict';
import { ApplicationCommandOptionType, Message } from 'discord.js';

export default class RemoveReactionEmojiCommand extends BotCommand {
	public constructor() {
		super('removeReactionEmoji', {
			aliases: ['remove-reaction-emoji', 'rre'],
			category: 'moderation',
			description: 'Delete all the reactions of a certain emoji from a message.',
			usage: ['remove-reaction-emoji <message> <emoji>'],
			examples: ['remove-reaction-emoji 791413052347252786 <:omegaclown:782630946435366942>'],
			args: [
				{
					id: 'message',
					description: 'The message to remove all the reactions of a certain emoji from.',
					type: Arg.union('message', 'messageLink'),
					readableType: 'message|messageLink',
					prompt: 'What message would you like to remove a reaction from?',
					retry: '{error} Please pick a valid message.',
					slashType: ApplicationCommandOptionType.String
				},
				{
					id: 'emoji',
					description: 'The emoji to remove all the reactions of from a message.',
					type: Arg.union('emoji', 'snowflake'),
					readableType: 'emoji|snowflake',
					match: 'restContent',
					prompt: 'What emoji would you like to remove?',
					retry: '{error} Please pick a valid emoji.',
					slashType: ApplicationCommandOptionType.String
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: ['ManageMessages', 'EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: ['ManageMessages', 'ManageEmojisAndStickers'], // Can't undo the removal of 1000s of reactions
			userCheckChannel: true
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { message: ArgType<'guildMessage'> | string; emoji: ArgType<'emoji' | 'snowflake'> }
	) {
		assert(message.channel);
		const resolvedMessage = args.message instanceof Message ? args.message : await message.channel.messages.fetch(args.message);

		const emojiID = typeof args.emoji === 'string' ? `${args.emoji}` : args.emoji.id;
		const success = !!(await resolvedMessage.reactions.cache
			?.get(emojiID!)
			?.remove()
			?.catch(() => undefined));

		if (success) {
			return await message.util.reply(
				`${emojis.success} Removed all reactions of ${format.input(emojiID!)} from the message with the id of ${format.input(
					resolvedMessage.id
				)}.`
			);
		} else {
			return await message.util.reply(
				`${emojis.error} There was an error removing all reactions of ${format.input(
					emojiID!
				)} from the message with the id of ${format.input(resolvedMessage.id)}.`
			);
		}
	}
}
