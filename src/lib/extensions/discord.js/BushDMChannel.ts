import { DMChannel } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushMessageManager } from './BushMessageManager';
import { BushUser } from './BushUser';

export class BushDMChannel extends DMChannel {
	public declare readonly client: BushClient;
	public declare messages: BushMessageManager;
	public declare recipient: BushUser;

	constructor(client: BushClient, data?: unknown) {
		super(client, data);
	}
}
