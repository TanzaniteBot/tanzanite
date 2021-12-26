import type { BushClient, BushTextBasedChannel, BushThreadChannel } from '#lib';
import { Channel, type ChannelMention, type Snowflake } from 'discord.js';
import type { ChannelTypes } from 'discord.js/typings/enums';
import type { RawChannelData } from 'discord.js/typings/rawDataTypes';
import { BushBaseGuildVoiceChannel } from './BushBaseGuildVoiceChannel';

/**
 * Represents any channel on Discord.
 */
export class BushChannel extends Channel {
	public constructor(client: BushClient, data?: RawChannelData, immediatePatch?: boolean);
	public readonly createdAt: Date;
	public readonly createdTimestamp: number;
	public deleted: boolean;
	public id: Snowflake;
	public readonly partial: false;
	public type: keyof typeof ChannelTypes;
	public delete(): Promise<this>;
	public fetch(force?: boolean): Promise<this>;
	public isText(): this is BushTextBasedChannel;
	public isVoice(): this is BushBaseGuildVoiceChannel;
	public isThread(): this is BushThreadChannel;
	public toString(): ChannelMention;
}
