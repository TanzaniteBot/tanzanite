import type { BushMessageReaction } from '#lib';
import { ReactionEmoji } from 'discord.js';
import type { RawReactionEmojiData } from 'discord.js/typings/rawDataTypes';

export class BushReactionEmoji extends ReactionEmoji {
	public declare reaction: BushMessageReaction;
	public constructor(reaction: BushMessageReaction, emoji: RawReactionEmojiData) {
		super(reaction, emoji);
	}
}
