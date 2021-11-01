import { BushCommand, type BushMessage } from '@lib';
import { type Emoji, type Snowflake } from 'discord.js';

export default class RemoveReactionEmojiCommand extends BushCommand {
	public constructor() {
		super('removeReactionEmoji', {
			aliases: ['remove-reaction-emoji', 'rre'],
			category: 'moderation',
			description: {
				content: 'Deleted all the reactions of a certain emoji from a message.',
				usage: ['remove-reaction-emoji <message> <emoji>'],
				examples: ['remove-reaction-emoji 791413052347252786 <:omegaclown:782630946435366942>']
			},
			args: [
				{
					id: 'messageToRemoveFrom',
					type: 'guildMessage',
					prompt: {
						start: 'What message would you like to remove a reaction from?',
						retry: '{error} Please pick a valid message.'
					}
				},
				{
					id: 'emoji',
					customType: util.arg.union('emoji', 'snowflake'),
					match: 'restContent',
					prompt: {
						start: 'What emoji would you like to remove?',
						retry: '{error} Please pick a valid emoji.'
					}
				}
			],
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['MANAGE_MESSAGES', 'EMBED_LINKS'], true),
			userPermissions: ['MANAGE_MESSAGES', 'MANAGE_EMOJIS_AND_STICKERS'] // Can't undo the removal of 1000s of reactions
		});
	}

	public override async exec(
		message: BushMessage,
		{ messageToRemoveFrom, emoji }: { messageToRemoveFrom: BushMessage; emoji: Emoji | Snowflake }
	) {
		const id = !['string'].includes(typeof emoji);
		const emojiID = !id ? `${emoji}` : (emoji as Emoji).id;
		const success = await messageToRemoveFrom.reactions.cache
			?.get(emojiID!)
			?.remove()
			?.catch(() => {});
		if (success) {
			return await message.util.reply(
				`${util.emojis.success} Removed all reactions of \`${id ? emojiID : emoji}\` from the message with the id of \`${
					messageToRemoveFrom.id
				}\`.`
			);
		} else {
			return await message.util.reply(
				`${util.emojis.error} There was an error removing all reactions of \`${
					id ? emojiID : emoji
				}\` from the message with the id of \`${messageToRemoveFrom.id}\`.`
			);
		}
	}
}
