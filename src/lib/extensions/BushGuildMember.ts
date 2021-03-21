import { GuildMember } from 'discord.js';
import BushClient from './BushClient';
import { BushGuild } from './BushGuild';
import { BushUser } from './BushUser';

export class BushGuildMember extends GuildMember {
	guild: BushGuild;
	client: BushClient;
	user: BushUser;

	// eslint-disable-next-line @typescript-eslint/ban-types
	constructor(client: BushClient, data: object, guild: BushGuild) {
		super(client, data, guild);
	}
}
