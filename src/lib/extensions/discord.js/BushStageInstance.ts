import { type BushClient, type BushGuild, type BushStageChannel } from '@lib';
import { StageInstance } from 'discord.js';
import { type RawStageInstanceData } from 'discord.js/typings/rawDataTypes';

export class BushStageInstance extends StageInstance {
	public declare readonly channel: BushStageChannel | null;
	public declare readonly guild: BushGuild | null;
	public constructor(client: BushClient, data: RawStageInstanceData, channel: BushStageChannel) {
		super(client, data, channel);
	}
}
