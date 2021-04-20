import BushClient, { MessageType } from './BushClient';
import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

export class BushInhibitor extends Inhibitor {
	public client = <BushClient>super.client;
	public log(message: MessageType): Promise<Message> {
		return this.client.log(message);
	}
	public error(message: MessageType): Promise<Message> {
		return this.client.error(message);
	}
}
