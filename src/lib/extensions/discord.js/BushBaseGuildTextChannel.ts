import type { BushCategoryChannel, BushClient, BushGuild, BushGuildMember, BushMessageManager, BushThreadManager } from '#lib';
import {
	BaseGuildTextChannel,
	type AllowedThreadTypeForNewsChannel,
	type AllowedThreadTypeForTextChannel,
	type Collection,
	type Snowflake
} from 'discord.js';
import type { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a text-based guild channel on Discord.
 */
export class BushBaseGuildTextChannel extends BaseGuildTextChannel {
	public declare messages: BushMessageManager;
	public declare threads: BushThreadManager<AllowedThreadTypeForTextChannel | AllowedThreadTypeForNewsChannel>;
	public declare readonly client: BushClient;
	public declare guild: BushGuild;

	public constructor(guild: BushGuild, data?: RawGuildChannelData, client?: BushClient, immediatePatch?: boolean) {
		super(guild, data, client, immediatePatch);
	}
}

export interface BushBaseGuildTextChannel extends BaseGuildTextChannel {
	get members(): Collection<Snowflake, BushGuildMember>;
	get parent(): BushCategoryChannel | null;
}
