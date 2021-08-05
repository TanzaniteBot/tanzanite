import { Collection, Snowflake, VoiceChannel } from 'discord.js';
import { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';

export class BushVoiceChannel extends VoiceChannel {
	public declare readonly client: BushClient;
	public declare readonly members: Collection<Snowflake, BushGuildMember>;
	public constructor(guild: BushGuild, data?: RawGuildChannelData) {
		super(guild, data);
	}
}
