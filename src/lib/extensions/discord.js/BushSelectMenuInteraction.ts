import type { BushClient, BushGuild, BushGuildMember, BushGuildTextBasedChannel, BushTextBasedChannel, BushUser } from '#lib';
import type { APIInteractionGuildMember } from 'discord-api-types/v9';
import { SelectMenuInteraction, type CacheType, type CacheTypeReducer } from 'discord.js';
import type { RawMessageSelectMenuInteractionData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a select menu interaction.
 */
export class BushSelectMenuInteraction<Cached extends CacheType = CacheType> extends SelectMenuInteraction<Cached> {
	public declare member: CacheTypeReducer<Cached, BushGuildMember, APIInteractionGuildMember>;
	public declare user: BushUser;

	public constructor(client: BushClient, data: RawMessageSelectMenuInteractionData) {
		super(client, data);
	}
}

export interface BushSelectMenuInteraction<Cached extends CacheType = CacheType> extends SelectMenuInteraction<Cached> {
	get channel(): CacheTypeReducer<
		Cached,
		BushGuildTextBasedChannel | null,
		BushGuildTextBasedChannel | null,
		BushGuildTextBasedChannel | null,
		BushTextBasedChannel | null
	>;
	get guild(): CacheTypeReducer<Cached, BushGuild, null>;
	inGuild(): this is BushSelectMenuInteraction<'raw' | 'cached'>;
	inCachedGuild(): this is BushSelectMenuInteraction<'cached'>;
	inRawGuild(): this is BushSelectMenuInteraction<'raw'>;
}
