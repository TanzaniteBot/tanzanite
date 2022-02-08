import { BaseGuildVoiceChannel, Collection, Snowflake } from 'discord.js';
import { BushCategoryChannel } from './BushCategoryChannel.js';
import { BushGuild } from './BushGuild.js';
import { BushGuildMember } from './BushGuildMember.js';

/**
 * Represents a voice-based guild channel on Discord.
 */
export declare class BushBaseGuildVoiceChannel extends BaseGuildVoiceChannel {
	public readonly members: Collection<Snowflake, BushGuildMember>;
	public guild: BushGuild;
	public readonly parent: BushCategoryChannel | null;
}
