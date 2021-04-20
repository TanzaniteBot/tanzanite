import { DMChannel, NewsChannel, Message } from 'discord.js';
import { BushGuildMember } from './BushGuildMember';
import { BushTextChannel } from './BushTextChannel';
import { BushGuild } from './BushGuild';
import { BushUser } from './BushUser';
import BushClient from './BushClient';

export class BushMessage extends Message {
	member: BushGuildMember;
	channel: BushTextChannel | DMChannel | NewsChannel;
	guild: BushGuild;
	author: BushUser;
	client: BushClient;
	constructor(client: BushClient, data: Record<string, unknown>, channel: BushTextChannel | DMChannel | NewsChannel) {
		super(client, data, channel);
	}
}