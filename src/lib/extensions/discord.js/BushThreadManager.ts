import type { BushThreadChannel } from '#lib';
import {
	CachedManager,
	FetchedThreads,
	NewsChannel,
	TextChannel,
	ThreadChannel,
	ThreadManager,
	type BaseFetchOptions,
	type FetchArchivedThreadOptions,
	type FetchThreadsOptions,
	type Snowflake,
	type ThreadChannelResolvable,
	type ThreadCreateOptions
} from 'discord.js';
import type { RawThreadChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Manages API methods for {@link BushThreadChannel} objects and stores their cache.
 */
export declare class BushThreadManager<AllowedThreadType>
	extends CachedManager<Snowflake, BushThreadChannel, ThreadChannelResolvable>
	implements ThreadManager<AllowedThreadType>
{
	public constructor(channel: TextChannel | NewsChannel, iterable?: Iterable<RawThreadChannelData>);

	/**
	 * The channel this Manager belongs to
	 */
	public channel: TextChannel | NewsChannel;

	/**
	 * Creates a new thread in the channel.
	 * @param options Options to create a new thread
	 * @example
	 * // Create a new public thread
	 * channel.threads
	 *   .create({
	 *     name: 'food-talk',
	 *     autoArchiveDuration: 60,
	 *     reason: 'Needed a separate thread for food',
	 *   })
	 *   .then(threadChannel => console.log(threadChannel))
	 *   .catch(console.error);
	 * @example
	 * // Create a new private thread
	 * channel.threads
	 *   .create({
	 *      name: 'mod-talk',
	 *      autoArchiveDuration: 60,
	 *      type: 'GuildPrivateThread',
	 *      reason: 'Needed a separate thread for moderation',
	 *    })
	 *   .then(threadChannel => console.log(threadChannel))
	 *   .catch(console.error);
	 */
	public create(options: ThreadCreateOptions<AllowedThreadType>): Promise<ThreadChannel>;

	/**
	 * Obtains a thread from Discord, or the channel cache if it's already available.
	 * @param options The options to fetch threads. If it is a
	 * ThreadChannelResolvable then the specified thread will be fetched. Fetches all active threads if `undefined`
	 * @param cacheOptions Additional options for this fetch. <warn>The `force` field gets ignored
	 * if `options` is not a {@link ThreadChannelResolvable}</warn>
	 * @example
	 * // Fetch a thread by its id
	 * channel.threads.fetch('831955138126104859')
	 *   .then(channel => console.log(channel.name))
	 *   .catch(console.error);
	 */
	public fetch(options: ThreadChannelResolvable, cacheOptions?: BaseFetchOptions): Promise<BushThreadChannel | null>;
	public fetch(options?: FetchThreadsOptions, cacheOptions?: { cache?: boolean }): Promise<FetchedThreads>;

	/**
	 * Obtains a set of archived threads from Discord, requires `READ_MESSAGE_HISTORY` in the parent channel.
	 * @param options The options to fetch archived threads
	 * @param cache Whether to cache the new thread objects if they aren't already
	 */
	public fetchArchived(options?: FetchArchivedThreadOptions, cache?: boolean): Promise<FetchedThreads>;

	/**
	 * Obtains the accessible active threads from Discord, requires `READ_MESSAGE_HISTORY` in the parent channel.
	 * @param cache Whether to cache the new thread objects if they aren't already
	 */
	public fetchActive(cache?: boolean): Promise<FetchedThreads>;
}
