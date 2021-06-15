import { DMChannel, Message, NewsChannel, TextChannel } from 'discord.js';
import { BushClient } from './BushClient';

export class BushMessage extends Message {
	declare client: BushClient;
	constructor(client: BushClient, data: unknown, channel: TextChannel | DMChannel | NewsChannel) {
		super(client, data, channel);
		this.client = client;
		this.channel = channel;
	}
}
