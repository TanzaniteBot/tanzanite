import { DMChannel, Message, NewsChannel, TextChannel } from 'discord.js';
import { BushClient } from './BushClient';
import { BushCommandUtil } from './BushCommandUtil';

export class BushMessage extends Message {
	declare client: BushClient;
	declare util: BushCommandUtil;
	constructor(client: BushClient, data: unknown, channel: TextChannel | DMChannel | NewsChannel) {
		super(client, data, channel);
		this.client = client;
		this.channel = channel;
	}
}
