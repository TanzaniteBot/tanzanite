import { APIInteractionGuildMember } from 'discord-api-types/v9';
import { CacheType, CacheTypeReducer, SelectMenuInteraction } from 'discord.js';
import { RawMessageSelectMenuInteractionData } from 'discord.js/typings/rawDataTypes';
import { BushClient, BushTextBasedChannels } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushUser } from './BushUser';

export class BushSelectMenuInteraction<Cached extends CacheType = CacheType> extends SelectMenuInteraction<Cached> {
	public declare readonly channel: BushTextBasedChannels | null;
	public declare readonly guild: CacheTypeReducer<Cached, BushGuild, null>;
	public declare member: CacheTypeReducer<Cached, BushGuildMember, APIInteractionGuildMember>;
	public declare user: BushUser;
	public constructor(client: BushClient, data: RawMessageSelectMenuInteractionData) {
		super(client, data);
	}
}
