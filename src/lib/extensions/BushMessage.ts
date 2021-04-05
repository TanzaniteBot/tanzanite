import { DMChannel, NewsChannel } from 'discord.js';
import { Message } from 'discord.js';
import BushClient from './BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushTextChannel } from './BushTextChannel';
import { BushUser } from './BushUser';

export class BushMessage extends Message {
	member: BushGuildMember;
	channel: BushTextChannel | DMChannel | NewsChannel;
	guild: BushGuild;
	author: BushUser;
	client: BushClient;
	// eslint-disable-next-line @typescript-eslint/ban-types
	constructor(
		client: BushClient,
		data: object,
		channel: BushTextChannel | DMChannel | NewsChannel
	) {
		super(client, data, channel);
	}
}
