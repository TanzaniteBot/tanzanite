import { TextChannel } from 'discord.js';
import { BushGuild } from './BushGuild';
import BushClient from './BushClient';

export class BushTextChannel extends TextChannel {
	// eslint-disable-next-line @typescript-eslint/ban-types
	constructor(guild: BushGuild, data?: object) {
		super(guild, data);
	}

	guild: BushGuild;
	client: BushClient;
}
