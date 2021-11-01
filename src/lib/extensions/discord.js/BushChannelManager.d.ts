import { type BushChannel, type BushChannelResolvable } from '@lib';
import { CachedManager, type Client, type FetchChannelOptions, type Snowflake } from 'discord.js';
import { type RawChannelData } from 'discord.js/typings/rawDataTypes';

export class BushChannelManager extends CachedManager<Snowflake, BushChannel, BushChannelResolvable> {
	public constructor(client: Client, iterable: Iterable<RawChannelData>);
	public fetch(id: Snowflake, options?: FetchChannelOptions): Promise<BushChannel | null>;
}
