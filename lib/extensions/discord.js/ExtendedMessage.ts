import { CommandUtil } from '@tanzanite/discord-akairo';
import { Message, type Client, type OmitPartialGroupDMChannel } from 'discord.js';
import type { RawMessageData } from 'node_modules/discord.js/typings/rawDataTypes.mjs';

export class ExtendedMessage<InGuild extends boolean = boolean> extends Message<InGuild> {
	declare public util: CommandUtil<OmitPartialGroupDMChannel<Message<InGuild>>>;

	public constructor(client: Client<true>, data: RawMessageData) {
		super(client, data);
		// this is a bit of a lie
		this.util = new CommandUtil(client.commandHandler, this as OmitPartialGroupDMChannel<this>);
	}
}
