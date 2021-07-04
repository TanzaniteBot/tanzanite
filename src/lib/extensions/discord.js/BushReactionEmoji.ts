import { ReactionEmoji } from 'discord.js';
import { BushClient, BushMessageReaction } from '..';

export class BushReactionEmoji extends ReactionEmoji {
	public declare readonly client: BushClient;
	public declare reaction: BushMessageReaction;
	public constructor(reaction: BushMessageReaction, emoji: unknown) {
		super(reaction, emoji);
	}
}
