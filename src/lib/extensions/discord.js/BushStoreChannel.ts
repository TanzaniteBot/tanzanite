import { Collection, Snowflake, StoreChannel } from 'discord.js';
import { BushCategoryChannel, BushClient, BushGuild, BushGuildMember } from '..';

export class BushStoreChannel extends StoreChannel {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public declare readonly members: Collection<Snowflake, BushGuildMember>;
	public declare readonly parent: BushCategoryChannel | null;

	public constructor(guild: BushGuild, data?: unknown) {
		super(guild, data);
	}
}
