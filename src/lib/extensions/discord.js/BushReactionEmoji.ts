import { ReactionEmoji } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushMessageReaction } from './BushMessageReaction';

export class BushReactionEmoji extends ReactionEmoji {
	public declare readonly client: BushClient;
	public declare reaction: BushMessageReaction;
	public constructor(reaction: BushMessageReaction, emoji: unknown) {
		super(reaction, emoji);
	}
}
