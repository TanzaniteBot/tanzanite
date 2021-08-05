import { Snowflake } from 'discord-api-types';
import { CachedManager, Client, FetchChannelOptions } from 'discord.js';
import { RawChannelData } from 'discord.js/typings/rawDataTypes';
import { BushChannelResolvable } from '../discord-akairo/BushClient';
import { BushChannel } from './BushChannel';

export class BushChannelManager extends CachedManager<Snowflake, BushChannel, BushChannelResolvable> {
	public constructor(client: Client, iterable: Iterable<RawChannelData>);
	public fetch(id: Snowflake, options?: FetchChannelOptions): Promise<BushChannel | null>;
}
