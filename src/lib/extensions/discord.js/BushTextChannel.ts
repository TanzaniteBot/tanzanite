import { AllowedThreadTypeForTextChannel, TextChannel } from 'discord.js';
import { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushMessageManager } from './BushMessageManager';
import { BushThreadManager } from './BushThreadManager';

export class BushTextChannel extends TextChannel {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public declare messages: BushMessageManager;
	public declare threads: BushThreadManager<AllowedThreadTypeForTextChannel>;
	public constructor(guild: BushGuild, data?: RawGuildChannelData) {
		super(guild, data);
	}
}
