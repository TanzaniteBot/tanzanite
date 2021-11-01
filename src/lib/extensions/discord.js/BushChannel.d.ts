import { type BushClient, type BushStageChannel, type BushTextBasedChannels, type BushThreadChannel, type BushVoiceChannel } from '@lib';
import { Channel, type ChannelMention, type Snowflake } from 'discord.js';
import { type ChannelTypes } from 'discord.js/typings/enums';
import { type RawChannelData } from 'discord.js/typings/rawDataTypes';

export class BushChannel extends Channel {
	public constructor(client: BushClient, data?: RawChannelData, immediatePatch?: boolean);
	public readonly createdAt: Date;
	public readonly createdTimestamp: number;
	public deleted: boolean;
	public id: Snowflake;
	public readonly partial: false;
	public type: keyof typeof ChannelTypes;
	public delete(): Promise<BushChannel>;
	public fetch(force?: boolean): Promise<BushChannel>;
	public isText(): this is BushTextBasedChannels;
	public isVoice(): this is BushVoiceChannel | BushStageChannel;
	public isThread(): this is BushThreadChannel;
	public toString(): ChannelMention;
}
