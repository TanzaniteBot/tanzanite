import { BushMessageResolvable, type BushMessage, type BushTextBasedChannels } from '@lib';
import {
	CachedManager, type BaseFetchOptions,
	type ChannelLogsQueryOptions,
	type Collection,
	type EmojiIdentifierResolvable,
	type MessageEditOptions,
	type MessagePayload, type Snowflake
} from 'discord.js';
import { type RawMessageData } from 'discord.js/typings/rawDataTypes';

export class BushMessageManager extends CachedManager<Snowflake, BushMessage, BushMessageResolvable> {
  public constructor(channel: BushTextBasedChannels, iterable?: Iterable<RawMessageData>);
  public channel: BushTextBasedChannels;
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
