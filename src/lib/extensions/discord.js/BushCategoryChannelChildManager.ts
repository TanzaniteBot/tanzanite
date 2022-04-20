import type {
	BushCategoryChannel,
	BushGuild,
	BushGuildChannelResolvable,
	BushMappedChannelCategoryTypes,
	BushNonCategoryGuildBasedChannel,
	BushTextChannel
} from '#lib';
import type {
	CategoryChannelChildManager,
	CategoryChannelType,
	CategoryCreateChannelOptions,
	DataManager,
	Snowflake
} from 'discord.js';

export declare class BushCategoryChannelChildManager
	extends DataManager<Snowflake, BushNonCategoryGuildBasedChannel, BushGuildChannelResolvable>
	implements CategoryChannelChildManager
{
	private constructor(channel: BushCategoryChannel);

	/**
	 * The category channel this manager belongs to
	 */
	public channel: BushCategoryChannel;

	/**
	 * The guild this manager belongs to
	 */
	public readonly guild: BushGuild;

	/**
	 * Creates a new channel within this category.
	 * <info>You cannot create a channel of type {@link ChannelType.GuildCategory} inside a CategoryChannel.</info>
	 * @param name The name of the new channel
	 * @param options Options for creating the new channel
	 */
	public create<T extends CategoryChannelType>(
		name: string,
		options: CategoryCreateChannelOptions & { type: T }
	): Promise<BushMappedChannelCategoryTypes[T]>;
	public create(name: string, options?: CategoryCreateChannelOptions): Promise<BushTextChannel>;
}
