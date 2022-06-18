import { CommandUtil } from 'discord-akairo';
import { Message, type Client } from 'discord.js';
import { type RawMessageData } from 'discord.js/typings/rawDataTypes.js';

export class ExtendedMessage<Cached extends boolean = boolean> extends Message<Cached> {
	public declare util: CommandUtil<Message>;

	public constructor(client_: Client, data: RawMessageData) {
		super(client_, data);
		this.util = new CommandUtil(this.client.commandHandler, this);
	}
}
