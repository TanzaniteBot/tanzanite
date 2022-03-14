/* eslint-disable deprecation/deprecation */
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
	BushVoiceChannel,
	PartialBushDMChannel
} from '#lib';
import { APIMessage } from 'discord-api-types/v9';
import type {
	ApplicationCommandResolvable,
	CacheType,
	CacheTypeReducer,
	ChannelResolvable,
	ChannelType,
	Collection,
	EmojiIdentifierResolvable,
	EmojiResolvable,
	GuildChannelResolvable,
	GuildMemberResolvable,
	GuildTextChannelResolvable,
	MessageResolvable,
	RoleResolvable,
	Snowflake,
	ThreadChannelResolvable,
	ThreadMemberResolvable,
	UserResolvable
} from 'discord.js';

/**
 * Data that resolves to give a ThreadMember object.
 */
export type BushThreadMemberResolvable = ThreadMemberResolvable | BushThreadMember | BushUserResolvable;

/**
 * Data that resolves to give a User object.
 */
export type BushUserResolvable = UserResolvable | BushUser | Snowflake | BushMessage | BushGuildMember | BushThreadMember;

/**
 * Data that resolves to give a GuildMember object.
 */
export type BushGuildMemberResolvable = GuildMemberResolvable | BushGuildMember | BushUserResolvable;

/**
 * Data that can be resolved to a Role object.
 */
export type BushRoleResolvable = RoleResolvable | BushRole | Snowflake;

/**
 * Data that can be resolved to a Message object.
 */
export type BushMessageResolvable = MessageResolvable | BushMessage | Snowflake;

/**
 * Data that can be resolved into a GuildEmoji object.
 */
export type BushEmojiResolvable = EmojiResolvable | Snowflake | BushGuildEmoji | BushReactionEmoji;

/**
 * Data that can be resolved to give an emoji identifier. This can be:
 * * The unicode representation of an emoji
 * * The `<a:name:id>`, `<:name:id>`, `a:name:id` or `name:id` emoji identifier string of an emoji
 * * An EmojiResolvable
 */
export type BushEmojiIdentifierResolvable = EmojiIdentifierResolvable | string | BushEmojiResolvable;

/**
 * Data that can be resolved to a Thread Channel object.
 */
export type BushThreadChannelResolvable = ThreadChannelResolvable | BushThreadChannel | Snowflake;

/**
 * Data that resolves to give an ApplicationCommand object.
 */
export type BushApplicationCommandResolvable = ApplicationCommandResolvable | BushApplicationCommand | Snowflake;

/**
 * Data that can be resolved to a GuildTextChannel object.
 */
export type BushGuildTextChannelResolvable = GuildTextChannelResolvable | BushTextChannel | BushNewsChannel | Snowflake;

/**
 * Data that can be resolved to give a Channel object.
 */
export type BushChannelResolvable = ChannelResolvable | BushAnyChannel | Snowflake;

/**
 * Data that can be resolved to give a Guild Channel object.
 */
export type BushGuildChannelResolvable = GuildChannelResolvable | Snowflake | BushGuildBasedChannel;

export type BushAnyChannel =
	| BushCategoryChannel
	| BushDMChannel
	| PartialBushDMChannel
	| BushNewsChannel
	| BushStageChannel
	| BushStoreChannel
	| BushTextChannel
	| BushThreadChannel
	| BushVoiceChannel;

/**
 * The channels that are text-based.
 */
export type BushTextBasedChannel = PartialBushDMChannel | BushThreadChannel | BushDMChannel | BushNewsChannel | BushTextChannel;

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

export interface BushMappedChannelCategoryTypes {
	[ChannelType.GuildNews]: BushNewsChannel;
	[ChannelType.GuildVoice]: BushVoiceChannel;
	[ChannelType.GuildText]: BushTextChannel;
	[ChannelType.GuildStore]: BushStoreChannel;
	[ChannelType.GuildStageVoice]: BushStageChannel;
}

export type BushMappedGuildChannelTypes = {
	[ChannelType.GuildCategory]: BushCategoryChannel;
} & BushMappedChannelCategoryTypes;

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

export type BushNonCategoryGuildBasedChannel = Exclude<BushGuildBasedChannel, BushCategoryChannel>;

export type BushGuildCacheMessage<Cached extends CacheType> = CacheTypeReducer<
	Cached,
	BushMessage<true>,
	APIMessage,
	BushMessage | APIMessage,
	BushMessage | APIMessage
>;
