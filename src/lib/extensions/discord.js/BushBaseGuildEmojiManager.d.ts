import type { BushClient, BushEmojiIdentifierResolvable, BushEmojiResolvable, BushGuildEmoji } from '#lib';
import { CachedManager, type Snowflake } from 'discord.js';
import { type RawGuildEmojiData } from 'discord.js/typings/rawDataTypes';

export class BushBaseGuildEmojiManager extends CachedManager<Snowflake, BushGuildEmoji, BushEmojiResolvable> {
	public constructor(client: BushClient, iterable?: Iterable<RawGuildEmojiData>);
	public resolveIdentifier(emoji: BushEmojiIdentifierResolvable): string | null;
}
