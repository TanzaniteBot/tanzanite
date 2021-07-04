import { TextChannel } from 'discord.js';
import { BushClient, BushGuild, BushMessageManager } from '..';

export class BushTextChannel extends TextChannel {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public declare messages: BushMessageManager;
	public constructor(guild: BushGuild, data?: unknown) {
		super(guild, data);
	}
}
