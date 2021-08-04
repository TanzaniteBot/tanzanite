import { Snowflake } from 'discord-api-types';
import { Channel, ChannelMention } from 'discord.js';
import { ChannelTypes } from 'discord.js/typings/enums';
import { BushClient, BushTextBasedChannels } from '../discord-akairo/BushClient';
import { BushThreadChannel } from './BushThreadChannel';

export class BushChannel extends Channel {
	public constructor(client: BushClient, data?: unknown, immediatePatch?: boolean);
	public readonly createdAt: Date;
	public readonly createdTimestamp: number;
	public deleted: boolean;
	public id: Snowflake;
	public readonly partial: false;
	public type: keyof typeof ChannelTypes;
	public delete(): Promise<BushChannel>;
	public fetch(force?: boolean): Promise<BushChannel>;
	public isText(): this is BushTextBasedChannels;
	public isThread(): this is BushThreadChannel;
	public toString(): ChannelMention;
}
