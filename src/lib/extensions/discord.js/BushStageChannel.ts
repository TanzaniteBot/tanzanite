import type { BushCategoryChannel, BushGuild, BushGuildMember, BushStageInstance } from '#lib';
import { StageChannel, type Collection, type Snowflake } from 'discord.js';
import type { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a guild stage channel on Discord.
 */
export class BushStageChannel extends StageChannel {
	public declare guild: BushGuild;

	public constructor(guild: BushGuild, data?: RawGuildChannelData) {
		super(guild, data);
	}
}

export interface BushStageChannel extends StageChannel {
	get members(): Collection<Snowflake, BushGuildMember>;
	get parent(): BushCategoryChannel | null;
	get stageInstance(): BushStageInstance | null;
}
