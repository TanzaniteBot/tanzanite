import { DMChannel, Message, NewsChannel, Structures, TextChannel } from 'discord.js';
import { BushClient } from './BushClient';
import { BushCommandUtil } from './BushCommandUtil';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushUser } from './BushUser';

export class BushMessage extends Message {
	public declare client: BushClient;
	public declare util: BushCommandUtil;
	public declare guild: BushGuild;
	public declare member: BushGuildMember;
	public declare author: BushUser;
	public constructor(client: BushClient, data: unknown, channel: TextChannel | DMChannel | NewsChannel) {
		super(client, data, channel);
		this.client = client;
		this.channel = channel;
	}
}

Structures.extend('Message', () => BushMessage);
