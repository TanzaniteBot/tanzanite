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
	BushStoreChannel,
	BushTextBasedChannel,
	BushTextChannel,
	BushThreadChannel,
	BushVoiceBasedChannel
} from '#lib';
import { VoiceChannel, type Collection, type Snowflake } from 'discord.js';
import type { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a guild voice channel on Discord.
 */
export class BushVoiceChannel extends VoiceChannel {
	public declare readonly client: BushClient;
	public declare readonly members: Collection<Snowflake, BushGuildMember>;

	public constructor(guild: BushGuild, data?: RawGuildChannelData) {
		super(guild, data);
	}
}

export interface BushVoiceChannel extends VoiceChannel {
	isText(): this is BushTextChannel;
	isDM(): this is BushDMChannel;
	isVoice(): this is BushVoiceChannel;
	isCategory(): this is BushCategoryChannel;
	isNews(): this is BushNewsChannel;
	isStore(): this is BushStoreChannel;
	isThread(): this is BushThreadChannel;
	isStage(): this is BushStageChannel;
	isTextBased(): this is BushGuildBasedChannel & BushTextBasedChannel;
	isVoiceBased(): this is BushVoiceBasedChannel;
}
