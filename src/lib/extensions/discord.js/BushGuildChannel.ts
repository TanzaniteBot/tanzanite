import type { BushClient, BushGuild } from '#lib';
import { GuildChannel } from 'discord.js';
import type { RawGuildChannelData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a guild channel from any of the following:
 * - {@link BushTextChannel}
 * - {@link BushVoiceChannel}
 * - {@link BushCategoryChannel}
 * - {@link BushNewsChannel}
 * - {@link BushStoreChannel}
 * - {@link BushStageChannel}
 */
export class BushGuildChannel extends GuildChannel {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;

	public constructor(guild: BushGuild, data?: RawGuildChannelData, client?: BushClient, immediatePatch?: boolean) {
		super(guild, data, client, immediatePatch);
	}
}
