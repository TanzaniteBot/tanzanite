import { ReactionEmoji } from 'discord.js';
import { RawReactionEmojiData } from 'discord.js/typings/rawDataTypes';
import { BushClient } from '../discord-akairo/BushClient';
import { BushMessageReaction } from './BushMessageReaction';

export class BushReactionEmoji extends ReactionEmoji {
	public declare readonly client: BushClient;
	public declare reaction: BushMessageReaction;
	public constructor(reaction: BushMessageReaction, emoji: RawReactionEmojiData) {
		super(reaction, emoji);
	}
}
