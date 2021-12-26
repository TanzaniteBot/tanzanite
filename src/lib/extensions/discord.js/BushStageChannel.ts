import type { BushCategoryChannel, BushGuild, BushGuildMember, BushStageInstance } from '#lib';
import { StageChannel, type Collection, type Snowflake } from 'discord.js';
import type { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a guild stage channel on Discord.
 */
export class BushStageChannel extends StageChannel {
	public declare readonly members: Collection<Snowflake, BushGuildMember>;
	public declare guild: BushGuild;
	public declare readonly parent: BushCategoryChannel | null;
	public declare readonly stageInstance: BushStageInstance | null;

	public constructor(guild: BushGuild, data?: RawGuildChannelData) {
		super(guild, data);
	}
}
