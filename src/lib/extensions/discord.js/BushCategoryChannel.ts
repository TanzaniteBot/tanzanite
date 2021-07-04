import { CategoryChannel, Collection, Snowflake } from 'discord.js';
import { BushClient, BushGuild, BushGuildChannel, BushGuildMember } from '..';

export class BushCategoryChannel extends CategoryChannel {
	public declare readonly client: BushClient;
	public declare readonly children: Collection<Snowflake, BushGuildChannel>;
	public declare guild: BushGuild;
	public declare readonly members: Collection<Snowflake, BushGuildMember>;
	public declare readonly parent: CategoryChannel | null;
	public constructor(guild: BushGuild, data?: unknown) {
		super(guild, data);
	}
}
