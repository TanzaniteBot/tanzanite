import { Collection, Snowflake, StageChannel } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushCategoryChannel } from './BushCategoryChannel';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushStageInstance } from './BushStageInstance';

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
