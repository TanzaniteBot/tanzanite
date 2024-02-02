import { CommandUtil } from '@tanzanite/discord-akairo';
import { Message, type Client } from 'discord.js';
import type { RawMessageData } from 'node_modules/discord.js/typings/rawDataTypes.mjs';

export class ExtendedMessage<InGuild extends boolean = boolean> extends Message<InGuild> {
	public declare util: CommandUtil<Message<InGuild>>;

	public constructor(client: Client<true>, data: RawMessageData) {
		super(client, data);
		this.util = new CommandUtil(client.commandHandler, this);
	}
}
