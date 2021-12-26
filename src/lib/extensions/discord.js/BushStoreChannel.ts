import type { BushCategoryChannel, BushClient, BushGuild, BushGuildMember } from '#lib';
import { StoreChannel, type Collection, type Snowflake } from 'discord.js';
import type { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a guild store channel on Discord.
 * @deprecated Store channels are deprecated and will be removed from Discord in March 2022. See [Self-serve Game Selling Deprecation](https://support-dev.discord.com/hc/en-us/articles/4414590563479) for more information
 */
// eslint-disable-next-line deprecation/deprecation
export class BushStoreChannel extends StoreChannel {
	public declare guild: BushGuild;
	public declare readonly members: Collection<Snowflake, BushGuildMember>;
	public declare readonly parent: BushCategoryChannel | null;

	public constructor(guild: BushGuild, data?: RawGuildChannelData, client?: BushClient) {
		super(guild, data, client);
	}
}
