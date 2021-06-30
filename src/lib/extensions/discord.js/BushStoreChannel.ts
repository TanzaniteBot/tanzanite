import { Collection, Snowflake, StoreChannel } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushCategoryChannel } from './BushCategoryChannel';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';

export class BushStoreChannel extends StoreChannel {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public declare readonly members: Collection<Snowflake, BushGuildMember>;
	public declare readonly parent: BushCategoryChannel | null;

	constructor(guild: BushGuild, data?: unknown) {
		super(guild, data);
	}
}
