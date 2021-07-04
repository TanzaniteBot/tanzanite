import { Collection, Snowflake, VoiceChannel } from 'discord.js';
import { BushClient, BushGuild, BushGuildMember } from '..';

export class BushVoiceChannel extends VoiceChannel {
	public declare readonly client: BushClient;
	public declare readonly members: Collection<Snowflake, BushGuildMember>;
	public constructor(guild: BushGuild, data?: unknown) {
		super(guild, data);
	}
}
