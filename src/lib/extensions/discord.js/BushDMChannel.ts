import { DMChannel } from 'discord.js';
import { RawDMChannelData } from 'discord.js/typings/rawDataTypes';
import { BushClient } from '../discord-akairo/BushClient';
import { BushMessageManager } from './BushMessageManager';
import { BushUser } from './BushUser';

export class BushDMChannel extends DMChannel {
	public declare readonly client: BushClient;
	public declare messages: BushMessageManager;
	public declare recipient: BushUser;

	public constructor(client: BushClient, data?: RawDMChannelData) {
		super(client, data);
	}
}
