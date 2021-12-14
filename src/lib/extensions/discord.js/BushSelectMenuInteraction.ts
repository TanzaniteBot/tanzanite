import type { BushClient, BushGuild, BushGuildMember, BushGuildTextBasedChannel, BushTextBasedChannels, BushUser } from '#lib';
import type { APIInteractionGuildMember } from 'discord-api-types/v9';
import { SelectMenuInteraction, type CacheType, type CacheTypeReducer } from 'discord.js';
import type { RawMessageSelectMenuInteractionData } from 'discord.js/typings/rawDataTypes';

export class BushSelectMenuInteraction<Cached extends CacheType = CacheType> extends SelectMenuInteraction<Cached> {
	public declare readonly channel: CacheTypeReducer<
		Cached,
		BushGuildTextBasedChannel | null,
		BushGuildTextBasedChannel | null,
		BushGuildTextBasedChannel | null,
		BushTextBasedChannels | null
	>;
	public declare readonly guild: CacheTypeReducer<Cached, BushGuild, null>;
	public declare member: CacheTypeReducer<Cached, BushGuildMember, APIInteractionGuildMember>;
	public declare user: BushUser;

	public constructor(client: BushClient, data: RawMessageSelectMenuInteractionData) {
		super(client, data);
	}
}
