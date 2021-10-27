import { APIInteractionGuildMember } from 'discord-api-types/v9';
import { ButtonInteraction, CacheType, CacheTypeReducer } from 'discord.js';
import { RawMessageButtonInteractionData } from 'discord.js/typings/rawDataTypes';
import { BushClient, BushTextBasedChannels } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushUser } from './BushUser';

export class BushButtonInteraction<Cached extends CacheType = CacheType> extends ButtonInteraction<Cached> {
	public declare readonly channel: BushTextBasedChannels | null;
	public declare readonly guild: CacheTypeReducer<Cached, BushGuild, null>;
	public declare member: CacheTypeReducer<Cached, BushGuildMember, APIInteractionGuildMember>;
	public declare user: BushUser;
	public constructor(client: BushClient, data: RawMessageButtonInteractionData) {
		super(client, data);
	}
}
