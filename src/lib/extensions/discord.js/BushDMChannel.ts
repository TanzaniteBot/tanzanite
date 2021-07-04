import { DMChannel } from 'discord.js';
import { BushClient, BushMessageManager, BushUser } from '..';

export class BushDMChannel extends DMChannel {
	public declare readonly client: BushClient;
	public declare messages: BushMessageManager;
	public declare recipient: BushUser;

	public constructor(client: BushClient, data?: unknown) {
		super(client, data);
	}
}
