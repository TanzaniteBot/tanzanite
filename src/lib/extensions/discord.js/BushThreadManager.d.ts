import {
	BaseFetchOptions,
	CachedManager,
	FetchArchivedThreadOptions,
	FetchThreadsOptions,
	Snowflake,
	ThreadChannelResolvable,
	ThreadCreateOptions
} from 'discord.js';
import { RawThreadChannelData } from 'discord.js/typings/rawDataTypes';
import { BushClient, BushFetchedThreads, BushThreadChannelResolvable } from '../discord-akairo/BushClient';
import { BushNewsChannel } from './BushNewsChannel';
import { BushTextChannel } from './BushTextChannel';
import { BushThreadChannel } from './BushThreadChannel';

export class BushThreadManager<AllowedThreadType> extends CachedManager<Snowflake, BushThreadChannel, ThreadChannelResolvable> {
	public constructor(channel: BushTextChannel | BushNewsChannel, iterable?: Iterable<RawThreadChannelData>);
	public declare readonly client: BushClient;
	public channel: BushTextChannel | BushNewsChannel;
	public create(options: ThreadCreateOptions<AllowedThreadType>): Promise<BushThreadChannel>;
	public fetch(options: BushThreadChannelResolvable, cacheOptions?: BaseFetchOptions): Promise<BushThreadChannel | null>;
	public fetch(options?: FetchThreadsOptions, cacheOptions?: { cache?: boolean }): Promise<BushFetchedThreads>;
	public fetchArchived(options?: FetchArchivedThreadOptions, cache?: boolean): Promise<BushFetchedThreads>;
	public fetchActive(cache?: boolean): Promise<BushFetchedThreads>;
}
