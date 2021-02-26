import { Listener } from 'discord-akairo';
import BotClient, { MessageType } from './BotClient';
import { Message } from 'discord.js';

export class BotListener extends Listener {
	public client = <BotClient>super.client;
	public log(message: MessageType): Promise<Message> {
		return this.client.log(message);
	}
	public error(message: MessageType): Promise<Message> {
		return this.client.error(message);
	}
}
