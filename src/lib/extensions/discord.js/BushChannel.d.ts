import { Snowflake } from 'discord-api-types';
import { Channel, ChannelMention } from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';
import { RawChannelData } from 'discord.js/typings/rawDataTypes';
import { BushClient, BushTextBasedChannels } from '../discord-akairo/BushClient';
import { BushStageChannel } from './BushStageChannel';
import { BushThreadChannel } from './BushThreadChannel';
import { BushVoiceChannel } from './BushVoiceChannel';

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
