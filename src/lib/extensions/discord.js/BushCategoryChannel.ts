import { CategoryChannel, Collection, Snowflake } from 'discord.js';
import { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildChannel } from './BushGuildChannel';
import { BushGuildMember } from './BushGuildMember';

export class BushCategoryChannel extends CategoryChannel {
	public declare readonly client: BushClient;
	public declare readonly children: Collection<Snowflake, BushGuildChannel>;
	public declare guild: BushGuild;
	public declare readonly members: Collection<Snowflake, BushGuildMember>;
	public declare readonly parent: CategoryChannel | null;
	public constructor(guild: BushGuild, data?: RawGuildChannelData, client?: BushClient, immediatePatch?: boolean) {
		super(guild, data, client, immediatePatch);
	}
}
