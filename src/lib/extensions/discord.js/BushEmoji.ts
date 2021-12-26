import type { BushClient } from '#lib';
import { Emoji } from 'discord.js';
import type { RawEmojiData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents an emoji, see {@link GuildEmoji} and {@link ReactionEmoji}.
 */
export class BushEmoji extends Emoji {
	public declare readonly client: BushClient;

	public constructor(client: BushClient, emoji: RawEmojiData) {
		super(client, emoji);
	}
}
