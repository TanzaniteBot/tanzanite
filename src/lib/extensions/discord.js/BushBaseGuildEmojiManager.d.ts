import { Snowflake } from 'discord-api-types';
import { CachedManager } from 'discord.js';
import { BushClient, BushEmojiIdentifierResolvable, BushEmojiResolvable } from '../discord-akairo/BushClient';
import { BushGuildEmoji } from './BushGuildEmoji';

export class BushBaseGuildEmojiManager extends CachedManager<Snowflake, BushGuildEmoji, BushEmojiResolvable> {
	public constructor(client: BushClient, iterable?: Iterable<unknown>);
	public resolveIdentifier(emoji: BushEmojiIdentifierResolvable): string | null;
}
