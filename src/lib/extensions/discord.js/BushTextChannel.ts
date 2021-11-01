import type { BushGuild, BushMessageManager, BushThreadManager } from '#lib';
import { TextChannel, type AllowedThreadTypeForTextChannel } from 'discord.js';
import type { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';

export class BushTextChannel extends TextChannel {
	public declare guild: BushGuild;
	public declare messages: BushMessageManager;
	public declare threads: BushThreadManager<AllowedThreadTypeForTextChannel>;
	public constructor(guild: BushGuild, data?: RawGuildChannelData) {
		super(guild, data);
	}
}
