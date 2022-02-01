import type {
	BushFetchedThreads,
	BushGuild,
	BushGuildBasedChannel,
	BushMappedGuildChannelTypes,
	BushNonThreadGuildBasedChannel,
	BushStoreChannel
} from '#lib';
import {
	CachedManager,
	type BaseFetchOptions,
	type ChannelPosition,
	type Collection,
	type GuildChannelCreateOptions,
	type GuildChannelManager,
	type GuildChannelResolvable,
	type GuildChannelTypes,
	type Snowflake
} from 'discord.js';
import type { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Manages API methods for GuildChannels and stores their cache.
 */
export declare class BushGuildChannelManager
	extends CachedManager<Snowflake, BushGuildBasedChannel, GuildChannelResolvable>
	implements GuildChannelManager
{
	public constructor(guild: BushGuild, iterable?: Iterable<RawGuildChannelData>);

	/**
	 * The number of channels in this managers cache excluding thread channels
	 * that do not count towards a guild's maximum channels restriction.
	 */
	public readonly channelCountWithoutThreads: number;

	/**
	 * The guild this Manager belongs to
	 */
	public guild: BushGuild;

	/**
	 * Creates a new channel in the guild.
	 * @param name The name of the new channel
	 * @param options Options for creating the new channel
	 * @example
	 * // Create a new text channel
	 * guild.channels.create('new-general', { reason: 'Needed a cool new channel' })
	 *   .then(console.log)
	 *   .catch(console.error);
	 * @example
	 * // Create a new channel with permission overwrites
	 * guild.channels.create('new-voice', {
	 *   type: 'GuildVoice',
	 *   permissionOverwrites: [
	 *      {
	 *        id: message.author.id,
	 *        deny: [PermissionFlagsBits.ViewChannel],
	 *     },
	 *   ],
	 * })
	 * @deprecated See [Self-serve Game Selling Deprecation](https://support-dev.discord.com/hc/en-us/articles/4414590563479) for more information
	 */
	// eslint-disable-next-line deprecation/deprecation
	public create(name: string, options: GuildChannelCreateOptions & { type: 'GuildStore' }): Promise<BushStoreChannel>;

	/**
	 * Creates a new channel in the guild.
	 * @param name The name of the new channel
	 * @param options Options for creating the new channel
	 */
	public create<T extends GuildChannelTypes>(
		name: string,
		options: GuildChannelCreateOptions & { type: T }
	): Promise<BushMappedGuildChannelTypes[T]>;

	/**
	 * Creates a new channel in the guild.
	 * @param name The name of the new channel
	 * @param options Options for creating the new channel
	 */
	public create(name: string, options: GuildChannelCreateOptions): Promise<BushNonThreadGuildBasedChannel>;

	/**
	 * Obtains one or more guild channels from Discord, or the channel cache if they're already available.
	 * @param id The channel's id
	 * @param options Additional options for this fetch
	 * @example
	 * // Fetch all channels from the guild (excluding threads)
	 * message.guild.channels.fetch()
	 *   .then(channels => console.log(`There are ${channels.size} channels.`))
	 *   .catch(console.error);
	 * @example
	 * // Fetch a single channel
	 * message.guild.channels.fetch('222197033908436994')
	 *   .then(channel => console.log(`The channel name is: ${channel.name}`))
	 *   .catch(console.error);
	 */
	public fetch(id: Snowflake, options?: BaseFetchOptions): Promise<BushNonThreadGuildBasedChannel | null>;
	public fetch(id?: undefined, options?: BaseFetchOptions): Promise<Collection<Snowflake, BushNonThreadGuildBasedChannel>>;

	/**
	 * Batch-updates the guild's channels' positions.
	 * <info>Only one channel's parent can be changed at a time</info>
	 * @param channelPositions Channel positions to update
	 * @example
	 * guild.channels.setPositions([{ channel: channelId, position: newChannelIndex }])
	 *   .then(guild => console.log(`Updated channel positions for ${guild}`))
	 *   .catch(console.error);
	 */
	public setPositions(channelPositions: readonly ChannelPosition[]): Promise<BushGuild>;

	/**
	 * Obtains all active thread channels in the guild from Discord
	 * @param {} [cache=true] Whether to cache the fetched data
	 * @example
	 * // Fetch all threads from the guild
	 * message.guild.channels.fetchActiveThreads()
	 *   .then(fetched => console.log(`There are ${fetched.threads.size} threads.`))
	 *   .catch(console.error);
	 */
	public fetchActiveThreads(cache?: boolean): Promise<BushFetchedThreads>;
}
