import type { BushClient, BushEmojiIdentifierResolvable, BushEmojiResolvable, BushGuildEmoji } from '#lib';
import { BaseGuildEmojiManager, CachedManager, type Snowflake } from 'discord.js';
import { type RawGuildEmojiData } from 'discord.js/typings/rawDataTypes';

/**
 * Holds methods to resolve GuildEmojis and stores their cache.
 */
export declare class BushBaseGuildEmojiManager
	extends CachedManager<Snowflake, BushGuildEmoji, BushEmojiResolvable>
	implements BaseGuildEmojiManager
{
	public constructor(client: BushClient, iterable?: Iterable<RawGuildEmojiData>);

	/**
	 * Resolves an EmojiResolvable to an emoji identifier.
	 * @param emoji The emoji resolvable to resolve
	 */
	public resolveIdentifier(emoji: BushEmojiIdentifierResolvable): string | null;
}
