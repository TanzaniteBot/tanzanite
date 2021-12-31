import type { BushMessageReaction } from '#lib';
import { ReactionEmoji } from 'discord.js';
import type { RawReactionEmojiData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a limited emoji set used for both custom and unicode emojis. Custom emojis
 * will use this class opposed to the Emoji class when the client doesn't know enough
 * information about them.
 */
export class BushReactionEmoji extends ReactionEmoji {
	public declare reaction: BushMessageReaction;

	public constructor(reaction: BushMessageReaction, emoji: RawReactionEmojiData) {
		super(reaction, emoji);
	}
}
