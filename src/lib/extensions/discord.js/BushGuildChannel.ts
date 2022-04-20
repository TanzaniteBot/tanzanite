import type {
	BushCategoryChannel,
	BushClient,
	BushDMChannel,
	BushGuild,
	BushGuildBasedChannel,
	BushNewsChannel,
	BushStageChannel,
	BushTextBasedChannel,
	BushTextChannel,
	BushThreadChannel,
	BushVoiceBasedChannel,
	BushVoiceChannel
} from '#lib';
import { GuildChannel, PartialGroupDMChannel } from 'discord.js';
import type { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a guild channel from any of the following:
 * - {@link BushTextChannel}
 * - {@link BushVoiceChannel}
 * - {@link BushCategoryChannel}
 * - {@link BushNewsChannel}
 * - {@link BushStoreChannel}
 * - {@link BushStageChannel}
 */
export class BushGuildChannel extends GuildChannel {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;

	public constructor(guild: BushGuild, data?: RawGuildChannelData, client?: BushClient, immediatePatch?: boolean) {
		super(guild, data, client, immediatePatch);
	}
}

export interface BushGuildChannel extends GuildChannel {
	isText(): this is BushTextChannel;
	isDMBased(): this is PartialGroupDMChannel | BushDMChannel;
	isDM(): this is BushDMChannel;
	isVoice(): this is BushVoiceChannel;
	isCategory(): this is BushCategoryChannel;
	isNews(): this is BushNewsChannel;
	isThread(): this is BushThreadChannel;
	isStage(): this is BushStageChannel;
	isTextBased(): this is BushGuildBasedChannel & BushTextBasedChannel;
	isVoiceBased(): this is BushVoiceBasedChannel;
}
