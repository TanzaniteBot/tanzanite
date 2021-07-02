import { TextChannel } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushMessageManager } from './BushMessageManager';

export class BushTextChannel extends TextChannel {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public declare messages: BushMessageManager;
	public constructor(guild: BushGuild, data?: unknown) {
		super(guild, data);
	}
}
