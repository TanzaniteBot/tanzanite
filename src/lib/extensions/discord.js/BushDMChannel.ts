import { type BushClient, type BushMessageManager, type BushUser } from '@lib';
import { DMChannel } from 'discord.js';
import { type RawDMChannelData } from 'discord.js/typings/rawDataTypes';

export class BushDMChannel extends DMChannel {
	public declare readonly client: BushClient;
	public declare messages: BushMessageManager;
	public declare recipient: BushUser;

	public constructor(client: BushClient, data?: RawDMChannelData) {
		super(client, data);
	}
}
