import { StageInstance } from 'discord.js';
import { BushClient, BushGuild, BushStageChannel } from '..';

export class BushStageInstance extends StageInstance {
	public declare readonly client: BushClient;
	public declare readonly channel: BushStageChannel | null;
	public declare readonly guild: BushGuild | null;
	public constructor(client: BushClient, data: unknown, channel: BushStageChannel) {
		super(client, data, channel);
	}
}
