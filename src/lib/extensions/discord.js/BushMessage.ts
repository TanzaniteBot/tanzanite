import { Message } from 'discord.js';
import {
	BushClient,
	BushDMChannel,
	BushGuild,
	BushGuildMember,
	BushNewsChannel,
	BushTextChannel,
	BushThreadChannel,
	BushUser
} from '..';

export class BushMessage extends Message {
	public declare readonly client: BushClient;
	// public util: BushCommandUtil;
	public declare readonly guild: BushGuild;
	public declare readonly member: BushGuildMember;
	public declare author: BushUser;
	public declare channel: BushTextChannel | BushDMChannel | BushNewsChannel | BushThreadChannel;
	public constructor(
		client: BushClient,
		data: unknown,
		channel: BushTextChannel | BushDMChannel | BushNewsChannel | BushThreadChannel
	) {
		super(client, data, channel);
		// this.util = new BushCommandUtil(this.client.commandHandler, this);
	}
}
