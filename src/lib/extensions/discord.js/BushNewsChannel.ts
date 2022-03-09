import type { BushGuild, BushGuildMember, BushMessageManager, BushThreadManager } from '#lib';
import { NewsChannel, type AllowedThreadTypeForNewsChannel, type Collection, type Snowflake } from 'discord.js';

/**
 * Represents a guild news channel on Discord.
 */
export class BushNewsChannel extends NewsChannel {
	public declare threads: BushThreadManager<AllowedThreadTypeForNewsChannel>;
	public declare guild: BushGuild;
	public declare messages: BushMessageManager;
}

export interface BushNewsChannel extends NewsChannel {
	get members(): Collection<Snowflake, BushGuildMember>;
}
