import { AllowedThreadTypeForTextChannel, Collection, NewsChannel, Snowflake } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushMessageManager } from './BushMessageManager';
import { BushThreadManager } from './BushThreadManager';

export class BushNewsChannel extends NewsChannel {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public declare messages: BushMessageManager;
	public declare members: Collection<Snowflake, BushGuildMember>;
	public declare threads: BushThreadManager<AllowedThreadTypeForTextChannel>;
}
