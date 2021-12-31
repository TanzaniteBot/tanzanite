import type { BushClient, BushGuild, BushGuildMember, BushGuildTextBasedChannel, BushTextBasedChannel, BushUser } from '#lib';
import type { APIInteractionGuildMember } from 'discord-api-types/v9';
import { ButtonInteraction, type CacheType, type CacheTypeReducer } from 'discord.js';
import type { RawMessageButtonInteractionData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a button interaction.
 */
export class BushButtonInteraction<Cached extends CacheType = CacheType> extends ButtonInteraction<Cached> {
	public declare readonly channel: CacheTypeReducer<
		Cached,
		BushGuildTextBasedChannel | null,
		BushGuildTextBasedChannel | null,
		BushGuildTextBasedChannel | null,
		BushTextBasedChannel | null
	>;
	public declare readonly guild: CacheTypeReducer<Cached, BushGuild, null>;
	public declare member: CacheTypeReducer<Cached, BushGuildMember, APIInteractionGuildMember>;
	public declare user: BushUser;

	public constructor(client: BushClient, data: RawMessageButtonInteractionData) {
		super(client, data);
	}
}
