import type {
	BushCategoryChannel,
	BushClient,
	BushDMChannel,
	BushNewsChannel,
	BushStageChannel,
	BushTextBasedChannel,
	BushTextChannel,
	BushThreadChannel,
	BushVoiceBasedChannel,
	BushVoiceChannel
} from '#lib';
import { Channel, ChannelType, PartialGroupDMChannel, type Snowflake } from 'discord.js';
import type { RawChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents any channel on Discord.
 */
export declare class BushChannel extends Channel {
	public constructor(client: BushClient, data?: RawChannelData, immediatePatch?: boolean);
	public get createdAt(): Date | null;
	public get createdTimestamp(): number | null;
	public deleted: boolean;
	public id: Snowflake;
	public get partial(): false;
	public type: ChannelType;
	public delete(): Promise<this>;
	public fetch(force?: boolean): Promise<this>;
	public isText(): this is BushTextChannel;
	public isDM(): this is BushDMChannel;
	public isDMBased(): this is PartialGroupDMChannel | BushDMChannel;
	public isVoice(): this is BushVoiceChannel;
	public isCategory(): this is BushCategoryChannel;
	public isNews(): this is BushNewsChannel;
	public isThread(): this is BushThreadChannel;
	public isStage(): this is BushStageChannel;
	public isTextBased(): this is BushTextBasedChannel;
	public isVoiceBased(): this is BushVoiceBasedChannel;
}
