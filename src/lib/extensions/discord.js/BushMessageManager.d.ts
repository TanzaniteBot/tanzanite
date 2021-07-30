/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	BaseFetchOptions,
	CachedManager,
	ChannelLogsQueryOptions,
	Collection,
	EmojiIdentifierResolvable,
	MessageEditOptions,
	MessagePayload,
	Snowflake,
	TextBasedChannelFields
} from 'discord.js';
import { BushClient, BushMessageResolvable } from '../discord-akairo/BushClient';
import { BushDMChannel } from './BushDMChannel';
import { BushMessage } from './BushMessage';
import { BushTextChannel } from './BushTextChannel';
import { BushThreadChannel } from './BushThreadChannel';

export class BushMessageManager extends CachedManager<Snowflake, BushMessage, BushMessageResolvable> {
	public constructor(channel: BushTextChannel | BushDMChannel | BushThreadChannel, iterable?: Iterable<unknown>);
	public declare readonly client: BushClient;
	public channel: TextBasedChannelFields;
	public cache: Collection<Snowflake, BushMessage>;
	public crosspost(message: BushMessageResolvable): Promise<BushMessage>;
	public delete(message: BushMessageResolvable): Promise<void>;
	public edit(message: BushMessageResolvable, options: MessagePayload | MessageEditOptions): Promise<BushMessage>;
	public fetch(message: Snowflake, options?: BaseFetchOptions): Promise<BushMessage>;
	public fetch(options?: ChannelLogsQueryOptions, cacheOptions?: BaseFetchOptions): Promise<Collection<Snowflake, BushMessage>>;
	public fetchPinned(cache?: boolean): Promise<Collection<Snowflake, BushMessage>>;
	public react(message: BushMessageResolvable, emoji: EmojiIdentifierResolvable): Promise<void>;
	public pin(message: BushMessageResolvable): Promise<void>;
	public unpin(message: BushMessageResolvable): Promise<void>;
}
