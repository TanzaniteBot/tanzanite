import type { BushThreadChannel } from '#lib';
import {
	CachedManager,
	FetchedThreads,
	NewsChannel,
	TextChannel,
	ThreadChannel,
	type BaseFetchOptions,
	type FetchArchivedThreadOptions,
	type FetchThreadsOptions,
	type Snowflake,
	type ThreadChannelResolvable,
	type ThreadCreateOptions
} from 'discord.js';
import type { RawThreadChannelData } from 'discord.js/typings/rawDataTypes';

export class BushThreadManager<AllowedThreadType> extends CachedManager<Snowflake, BushThreadChannel, ThreadChannelResolvable> {
	public constructor(channel: TextChannel | NewsChannel, iterable?: Iterable<RawThreadChannelData>);
	public channel: TextChannel | NewsChannel;
	public create(options: ThreadCreateOptions<AllowedThreadType>): Promise<ThreadChannel>;
	public fetch(options: ThreadChannelResolvable, cacheOptions?: BaseFetchOptions): Promise<ThreadChannel | null>;
	public fetch(options?: FetchThreadsOptions, cacheOptions?: { cache?: boolean }): Promise<FetchedThreads>;
	public fetchArchived(options?: FetchArchivedThreadOptions, cache?: boolean): Promise<FetchedThreads>;
	public fetchActive(cache?: boolean): Promise<FetchedThreads>;
}
