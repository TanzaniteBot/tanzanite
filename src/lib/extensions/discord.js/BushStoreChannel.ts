/* eslint-disable deprecation/deprecation */
import type {
	BushCategoryChannel,
	BushClient,
	BushDMChannel,
	BushGuild,
	BushGuildBasedChannel,
	BushGuildMember,
	BushNewsChannel,
	BushStageChannel,
	BushTextBasedChannel,
	BushTextChannel,
	BushThreadChannel,
	BushVoiceBasedChannel,
	BushVoiceChannel
} from '#lib';
import { PartialGroupDMChannel, StoreChannel, type Collection, type Snowflake } from 'discord.js';
import type { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a guild store channel on Discord.
 * @deprecated Store channels are deprecated and will be removed from Discord in March 2022. See [Self-serve Game Selling Deprecation](https://support-dev.discord.com/hc/en-us/articles/4414590563479) for more information
 */
export class BushStoreChannel extends StoreChannel {
	public declare guild: BushGuild;

	public constructor(guild: BushGuild, data?: RawGuildChannelData, client?: BushClient) {
		super(guild, data, client);
	}
}

export interface BushStoreChannel extends StoreChannel {
	get members(): Collection<Snowflake, BushGuildMember>;
	get parent(): BushCategoryChannel | null;
	isText(): this is BushTextChannel;
	isDM(): this is BushDMChannel;
	isDMBased(): this is PartialGroupDMChannel | BushDMChannel;
	isVoice(): this is BushVoiceChannel;
	isCategory(): this is BushCategoryChannel;
	isNews(): this is BushNewsChannel;
	isStore(): this is BushStoreChannel;
	isThread(): this is BushThreadChannel;
	isStage(): this is BushStageChannel;
	isTextBased(): this is BushGuildBasedChannel & BushTextBasedChannel;
	isVoiceBased(): this is BushVoiceBasedChannel;
}
