import { Listener } from 'discord-akairo';
import BushClient, { MessageType } from './BushClient';
import { Message } from 'discord.js';

export class BushListener extends Listener {
	public client = <BushClient>super.client;
	public log(message: MessageType): Promise<Message> {
		return this.client.log(message);
	}
	public error(message: MessageType): Promise<Message> {
		return this.client.error(message);
	}
}
