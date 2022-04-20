import type {
	BushFetchedThreads,
	BushGuild,
	BushGuildBasedChannel,
	BushGuildChannel,
	BushMappedGuildChannelTypes,
	BushNonThreadGuildBasedChannel,
	BushTextChannel
} from '#lib';
import {
	CachedManager,
	ChannelData,
	ChannelWebhookCreateOptions,
	SetChannelPositionOptions,
	Webhook,
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
	 */
	public create<T extends GuildChannelTypes>(
		name: string,
		options: GuildChannelCreateOptions & { type: T }
	): Promise<BushMappedGuildChannelTypes[T]>;
	public create(name: string, options?: GuildChannelCreateOptions): Promise<BushTextChannel>;

	/**
	 * Creates a webhook for the channel.
	 * @param channel The channel to create the webhook for
	 * @param name The name of the webhook
	 * @param options Options for creating the webhook
	 * @returns Returns the created Webhook
	 * @example
	 * // Create a webhook for the current channel
	 * guild.channels.createWebhook('222197033908436994', 'Snek', {
	 *   avatar: 'https://i.imgur.com/mI8XcpG.jpg',
	 *   reason: 'Needed a cool new Webhook'
	 * })
	 *   .then(console.log)
	 *   .catch(console.error)
	 */
	public createWebhook(channel: GuildChannelResolvable, name: string, options?: ChannelWebhookCreateOptions): Promise<Webhook>;

	/**
	 * Edits the channel.
	 * @param channel The channel to edit
	 * @param data The new data for the channel
	 * @param reason Reason for editing this channel
	 * @example
	 * // Edit a channel
	 * guild.channels.edit('222197033908436994', { name: 'new-channel' })
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	public edit(channel: GuildChannelResolvable, data: ChannelData, reason?: string): Promise<BushGuildChannel>;

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
	 * Fetches all webhooks for the channel.
	 * @param channel The channel to fetch webhooks for
	 * @example
	 * // Fetch webhooks
	 * guild.channels.fetchWebhooks('769862166131245066')
	 *   .then(hooks => console.log(`This channel has ${hooks.size} hooks`))
	 *   .catch(console.error);
	 */
	public fetchWebhooks(channel: GuildChannelResolvable): Promise<Collection<Snowflake, Webhook>>;

	/**
	 * Sets a new position for the guild channel.
	 * @param channel The channel to set the position for
	 * @param position The new position for the guild channel
	 * @param options Options for setting position
	 * @example
	 * // Set a new channel position
	 * guild.channels.setPosition('222078374472843266', 2)
	 *   .then(newChannel => console.log(`Channel's new position is ${newChannel.position}`))
	 *   .catch(console.error);
	 */
	public setPosition(
		channel: GuildChannelResolvable,
		position: number,
		options?: SetChannelPositionOptions
	): Promise<BushGuildChannel>;

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

	/**
	 * Deletes the channel.
	 * @param channel The channel to delete
	 * @param reason Reason for deleting this channel
	 * @example
	 * // Delete the channel
	 * guild.channels.delete('858850993013260338', 'making room for new channels')
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	public delete(channel: GuildChannelResolvable, reason?: string): Promise<void>;
}
