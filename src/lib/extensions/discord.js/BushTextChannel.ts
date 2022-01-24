/* eslint-disable deprecation/deprecation */
import type {
	BushCategoryChannel,
	BushDMChannel,
	BushGuild,
	BushGuildBasedChannel,
	BushMessageManager,
	BushNewsChannel,
	BushStageChannel,
	BushStoreChannel,
	BushTextBasedChannel,
	BushThreadChannel,
	BushThreadManager,
	BushVoiceBasedChannel,
	BushVoiceChannel
} from '#lib';
import { TextChannel, type AllowedThreadTypeForTextChannel } from 'discord.js';
import type { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a guild text channel on Discord.
 */
export class BushTextChannel extends TextChannel {
	public declare guild: BushGuild;
	public declare messages: BushMessageManager;
	public declare threads: BushThreadManager<AllowedThreadTypeForTextChannel>;

	public constructor(guild: BushGuild, data?: RawGuildChannelData) {
		super(guild, data);
	}
}

export interface BushTextChannel extends TextChannel {
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
