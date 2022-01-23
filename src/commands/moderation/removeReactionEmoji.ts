import { BushCommand, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import { ApplicationCommandOptionType, Message, Permissions, type Emoji } from 'discord.js';

export default class RemoveReactionEmojiCommand extends BushCommand {
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
					type: 'guildMessage',
					prompt: 'What message would you like to remove a reaction from?',
					retry: '{error} Please pick a valid message.',
					slashType: ApplicationCommandOptionType.String
				},
				{
					id: 'emoji',
					description: 'The emoji to remove all the reactions of from a message.',
					type: util.arg.union('emoji', 'snowflake'),
					readableType: 'emoji|snowflake',
					match: 'restContent',
					prompt: 'What emoji would you like to remove?',
					retry: '{error} Please pick a valid emoji.',
					slashType: ApplicationCommandOptionType.String
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) =>
				util.clientSendAndPermCheck(m, [Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.EMBED_LINKS], true),
			userPermissions: [Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.MANAGE_EMOJIS_AND_STICKERS] // Can't undo the removal of 1000s of reactions
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { message: ArgType<'guildMessage'> | string; emoji: ArgType<'emoji'> | ArgType<'snowflake'> }
	) {
		assert(message.channel);
		const resolvedMessage = args.message instanceof Message ? args.message : await message.channel.messages.fetch(args.message);

		const id = !(['string'] as const).includes(typeof args.emoji);
		const emojiID = !id ? `${args.emoji}` : (args.emoji as Emoji).id;
		const success = await resolvedMessage.reactions.cache
			?.get(emojiID!)
			?.remove()
			?.catch(() => {});
		if (success) {
			return await message.util.reply(
				`${util.emojis.success} Removed all reactions of \`${id ? emojiID : args.emoji}\` from the message with the id of \`${
					resolvedMessage.id
				}\`.`
			);
		} else {
			return await message.util.reply(
				`${util.emojis.error} There was an error removing all reactions of \`${
					id ? emojiID : args.emoji
				}\` from the message with the id of \`${resolvedMessage.id}\`.`
			);
		}
	}
}
