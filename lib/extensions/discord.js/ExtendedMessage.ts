import { CommandUtil } from '@notenoughupdates/discord-akairo';
import { Message, type Client } from 'discord.js';
import type { RawMessageData } from 'discord.js/typings/rawDataTypes.js';

export class ExtendedMessage<InGuild extends boolean = boolean> extends Message<InGuild> {
	public declare util: CommandUtil<Message<InGuild>>;

	public constructor(client: Client<true>, data: RawMessageData) {
		super(client, data);
		this.util = new CommandUtil(client.commandHandler, this);
	}
}
