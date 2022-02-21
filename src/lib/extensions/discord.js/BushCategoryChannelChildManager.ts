/* eslint-disable deprecation/deprecation */
import type {
	BushCategoryChannel,
	BushGuild,
	BushGuildChannelResolvable,
	BushMappedChannelCategoryTypes,
	BushNonCategoryGuildBasedChannel,
	BushStoreChannel,
	BushTextChannel
} from '#lib';
import type { CategoryChannelType, CategoryCreateChannelOptions, ChannelType, DataManager, Snowflake } from 'discord.js';

export declare class BushCategoryChannelChildManager extends DataManager<
	Snowflake,
	BushNonCategoryGuildBasedChannel,
	BushGuildChannelResolvable
> {
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
	public create<T extends Exclude<CategoryChannelType, ChannelType.GuildStore>>(
		name: string,
		options: CategoryCreateChannelOptions & { type: T }
	): Promise<BushMappedChannelCategoryTypes[T]>;
	/**
	 * Creates a new channel within this category.
	 * <info>You cannot create a channel of type {@link ChannelType.GuildCategory} inside a CategoryChannel.</info>
	 * @param name The name of the new channel
	 * @param options Options for creating the new channel
	 * @deprecated See [Self-serve Game Selling Deprecation](https://support-dev.discord.com/hc/en-us/articles/4414590563479) for more information
	 */
	public create(
		name: string,
		options: CategoryCreateChannelOptions & { type: ChannelType.GuildStore }
	): Promise<BushStoreChannel>;
	public create(name: string, options?: CategoryCreateChannelOptions): Promise<BushTextChannel>;
}
