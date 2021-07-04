import { Collection, Snowflake, StageChannel } from 'discord.js';
import { BushCategoryChannel, BushClient, BushGuild, BushGuildMember, BushStageInstance } from '..';

export class BushStageChannel extends StageChannel {
	public declare readonly client: BushClient;
	public declare readonly instance: BushStageInstance | null;
	public declare readonly members: Collection<Snowflake, BushGuildMember>;
	public declare guild: BushGuild;
	public declare readonly parent: BushCategoryChannel | null;
	public constructor(guild: BushGuild, data?: unknown) {
		super(guild, data);
	}
}
