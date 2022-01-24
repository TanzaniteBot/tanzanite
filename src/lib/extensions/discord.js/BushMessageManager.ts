import { BushMessageResolvable, BushTextBasedChannel, type BushMessage } from '#lib';
import {
	CachedManager,
	MessageManager,
	type BaseFetchOptions,
	type ChannelLogsQueryOptions,
	type Collection,
	type EmojiIdentifierResolvable,
	type MessageEditOptions,
	type MessagePayload,
	type Snowflake
} from 'discord.js';
import type { RawMessageData } from 'discord.js/typings/rawDataTypes';

/**
 * Manages API methods for Messages and holds their cache.
 */
export declare class BushMessageManager
	extends CachedManager<Snowflake, BushMessage, BushMessageResolvable>
	implements MessageManager
{
	public constructor(channel: BushTextBasedChannel, iterable?: Iterable<RawMessageData>);

	/**
	 * The channel that the messages belong to
	 */
	public channel: BushTextBasedChannel;

	/**
	 * The cache of Messages
	 */
	public cache: Collection<Snowflake, BushMessage>;

	/**
	 * Publishes a message in an announcement channel to all channels following it, even if it's not cached.
	 * @param message The message to publish
	 */
	public crosspost(message: BushMessageResolvable): Promise<BushMessage>;

	/**
	 * Deletes a message, even if it's not cached.
	 * @param message The message to delete
	 */
	public delete(message: BushMessageResolvable): Promise<void>;

	/**
	 * Edits a message, even if it's not cached.
	 * @param message The message to edit
	 * @param options The options to edit the message
	 */
	public edit(message: BushMessageResolvable, options: string | MessagePayload | MessageEditOptions): Promise<BushMessage>;

	/**
	 * Gets a message, or messages, from this channel.
	 * <info>The returned Collection does not contain reaction users of the messages if they were not cached.
	 * Those need to be fetched separately in such a case.</info>
	 * @param message The id of the message to fetch, or query parameters.
	 * @param options Additional options for this fetch
	 * @example
	 * // Get message
	 * channel.messages.fetch('99539446449315840')
	 *   .then(message => console.log(message.content))
	 *   .catch(console.error);
	 * @example
	 * // Get messages
	 * channel.messages.fetch({ limit: 10 })
	 *   .then(messages => console.log(`Received ${messages.size} messages`))
	 *   .catch(console.error);
	 * @example
	 * // Get messages and filter by user id
	 * channel.messages.fetch()
	 *   .then(messages => console.log(`${messages.filter(m => m.author.id === '84484653687267328').size} messages`))
	 *   .catch(console.error);
	 */
	public fetch(message: Snowflake, options?: BaseFetchOptions): Promise<BushMessage>;
	public fetch(options?: ChannelLogsQueryOptions, cacheOptions?: BaseFetchOptions): Promise<Collection<Snowflake, BushMessage>>;

	/**
	 * Fetches the pinned messages of this channel and returns a collection of them.
	 * <info>The returned Collection does not contain any reaction data of the messages.
	 * Those need to be fetched separately.</info>
	 * @param {} [cache=true] Whether to cache the message(s)
	 * @example
	 * // Get pinned messages
	 * channel.messages.fetchPinned()
	 *   .then(messages => console.log(`Received ${messages.size} messages`))
	 *   .catch(console.error);
	 */
	public fetchPinned(cache?: boolean): Promise<Collection<Snowflake, BushMessage>>;

	/**
	 * Adds a reaction to a message, even if it's not cached.
	 * @param message The message to react to
	 * @param emoji The emoji to react with
	 */
	public react(message: BushMessageResolvable, emoji: EmojiIdentifierResolvable): Promise<void>;

	/**
	 * Pins a message to the channel's pinned messages, even if it's not cached.
	 * @param message The message to pin
	 */
	public pin(message: BushMessageResolvable): Promise<void>;

	/**
	 * Unpins a message from the channel's pinned messages, even if it's not cached.
	 * @param message The message to unpin
	 */
	public unpin(message: BushMessageResolvable): Promise<void>;
}
