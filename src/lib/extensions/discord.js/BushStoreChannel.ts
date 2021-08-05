import { Collection, Snowflake, StoreChannel } from 'discord.js';
import { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';
import { BushClient } from '../discord-akairo/BushClient';
import { BushCategoryChannel } from './BushCategoryChannel';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';

export class BushStoreChannel extends StoreChannel {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public declare readonly members: Collection<Snowflake, BushGuildMember>;
	public declare readonly parent: BushCategoryChannel | null;

	public constructor(guild: BushGuild, data?: RawGuildChannelData, client?: BushClient) {
		super(guild, data, client);
	}
}
