import type { BushCategoryChannel, BushGuild, BushGuildMember, BushStageInstance } from '#lib';
import { StageChannel, type Collection, type Snowflake } from 'discord.js';
import type { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';

export class BushStageChannel extends StageChannel {
	public declare readonly instance: BushStageInstance | null;
	public declare readonly members: Collection<Snowflake, BushGuildMember>;
	public declare guild: BushGuild;
	public declare readonly parent: BushCategoryChannel | null;

	public constructor(guild: BushGuild, data?: RawGuildChannelData) {
		super(guild, data);
	}
}
