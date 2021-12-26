import { BaseGuildVoiceChannel, Collection, Snowflake } from 'discord.js';
import { BushCategoryChannel } from './BushCategoryChannel';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';

/**
 * Represents a voice-based guild channel on Discord.
 */
export class BushBaseGuildVoiceChannel extends BaseGuildVoiceChannel {
	public readonly members: Collection<Snowflake, BushGuildMember>;
	public guild: BushGuild;
	public readonly parent: BushCategoryChannel | null;
}
