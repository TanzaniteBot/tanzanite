import type {
	BushApplicationCommand,
	BushCategoryChannel,
	BushDMChannel,
	BushGuild,
	BushGuildEmoji,
	BushGuildMember,
	BushMessage,
	BushNewsChannel,
	BushReactionEmoji,
	BushRole,
	BushStageChannel,
	BushStoreChannel,
	BushTextChannel,
	BushThreadChannel,
	BushThreadMember,
	BushUser,
	BushVoiceChannel
} from '#lib';
import type { Collection, EnumValueMapped, Message, PartialDMChannel, Snowflake } from 'discord.js';
import type { ChannelTypes } from 'discord.js/typings/enums';

/**
 * Data that resolves to give a ThreadMember object.
 */
export type BushThreadMemberResolvable = BushThreadMember | BushUserResolvable;

/**
 * Data that resolves to give a User object.
 */
export type BushUserResolvable = BushUser | Snowflake | BushMessage | BushGuildMember | BushThreadMember;

/**
 * Data that resolves to give a GuildMember object.
 */
export type BushGuildMemberResolvable = BushGuildMember | BushUserResolvable;

/**
 * Data that can be resolved to a Role object.
 */
export type BushRoleResolvable = BushRole | Snowflake;

/**
 * Data that can be resolved to a Message object.
 */
export type BushMessageResolvable = Message | BushMessage | Snowflake;

/**
 * Data that can be resolved into a GuildEmoji object.
 */
export type BushEmojiResolvable = Snowflake | BushGuildEmoji | BushReactionEmoji;

/**
 * Data that can be resolved to give an emoji identifier. This can be:
 * * The unicode representation of an emoji
 * * The `<a:name:id>`, `<:name:id>`, `a:name:id` or `name:id` emoji identifier string of an emoji
 * * An EmojiResolvable
 */
export type BushEmojiIdentifierResolvable = string | BushEmojiResolvable;

/**
 * Data that can be resolved to a Thread Channel object.
 */
export type BushThreadChannelResolvable = BushThreadChannel | Snowflake;

/**
 * Data that resolves to give an ApplicationCommand object.
 */
export type BushApplicationCommandResolvable = BushApplicationCommand | Snowflake;

/**
 * Data that can be resolved to a GuildTextChannel object.
 */
export type BushGuildTextChannelResolvable = BushTextChannel | BushNewsChannel | Snowflake;

/**
 * Data that can be resolved to give a Channel object.
 */
export type BushChannelResolvable = BushAnyChannel | Snowflake;

/**
 * Data that can be resolved to give a Guild Channel object.
 */
export type BushGuildChannelResolvable = Snowflake | BushGuildBasedChannel;

export type BushAnyChannel =
	| BushCategoryChannel
	| BushDMChannel
	| PartialDMChannel
	| BushNewsChannel
	| BushStageChannel
	// eslint-disable-next-line deprecation/deprecation
	| BushStoreChannel
	| BushTextChannel
	| BushThreadChannel
	| BushVoiceChannel;

/**
 * The channels that are text-based.
 */
export type BushTextBasedChannel = PartialDMChannel | BushThreadChannel | BushDMChannel | BushNewsChannel | BushTextChannel;

/**
 * The types of channels that are text-based.
 */
export type BushTextBasedChannelTypes = BushTextBasedChannel['type'];

export type BushVoiceBasedChannel = Extract<BushAnyChannel, { bitrate: number }>;

export type BushGuildBasedChannel = Extract<BushAnyChannel, { guild: BushGuild }>;

export type BushNonThreadGuildBasedChannel = Exclude<BushGuildBasedChannel, BushThreadChannel>;

export type BushGuildTextBasedChannel = Extract<BushGuildBasedChannel, BushTextBasedChannel>;

/**
 * Data that can be resolved to a Text Channel object.
 */
export type BushTextChannelResolvable = Snowflake | BushTextChannel;

/**
 * Data that can be resolved to a GuildVoiceChannel object.
 */
export type BushGuildVoiceChannelResolvable = BushVoiceBasedChannel | Snowflake;

export type BushMappedChannelCategoryTypes = EnumValueMapped<
	typeof ChannelTypes,
	{
		GUILD_NEWS: BushNewsChannel;
		GUILD_VOICE: BushVoiceChannel;
		GUILD_TEXT: BushTextChannel;
		// eslint-disable-next-line deprecation/deprecation
		GUILD_STORE: BushStoreChannel;
		GUILD_STAGE_VOICE: BushStageChannel;
	}
>;

export type BushMappedGuildChannelTypes = EnumValueMapped<
	typeof ChannelTypes,
	{
		GUILD_CATEGORY: BushCategoryChannel;
	}
> &
	BushMappedChannelCategoryTypes;

/**
 * The data returned from a thread fetch that returns multiple threads.
 */
export interface BushFetchedThreads {
	/**
	 * The threads that were fetched, with any members returned
	 */
	threads: Collection<Snowflake, BushThreadChannel>;

	/**
	 * Whether there are potentially additional threads that require a subsequent call
	 */
	hasMore?: boolean;
}
