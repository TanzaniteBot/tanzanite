import type { BushClient, BushGuild, BushGuildMember } from '#lib';
import { VoiceChannel, type Collection, type Snowflake } from 'discord.js';
import type { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a guild voice channel on Discord.
 */
export class BushVoiceChannel extends VoiceChannel {
	public declare readonly client: BushClient;
	public declare readonly members: Collection<Snowflake, BushGuildMember>;

	public constructor(guild: BushGuild, data?: RawGuildChannelData) {
		super(guild, data);
	}
}
