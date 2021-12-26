import type { BushAnyChannel, BushChannelResolvable } from '#lib';
import { CachedManager, type Client, type FetchChannelOptions, type Snowflake } from 'discord.js';
import type { RawChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * A manager of channels belonging to a client
 */
export class BushChannelManager extends CachedManager<Snowflake, BushAnyChannel, BushChannelResolvable> {
	public constructor(client: Client, iterable: Iterable<RawChannelData>);

	/**
	 * Obtains a channel from Discord, or the channel cache if it's already available.
	 * @param id The channel's id
	 * @param options Additional options for this fetch
	 * @example
	 * // Fetch a channel by its id
	 * client.channels.fetch('222109930545610754')
	 *   .then(channel => console.log(channel.name))
	 *   .catch(console.error);
	 */
	public fetch(id: Snowflake, options?: FetchChannelOptions): Promise<BushAnyChannel | null>;
}
