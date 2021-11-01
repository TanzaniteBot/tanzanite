import type {
	BushApplicationCommand,
	BushGuild,
	BushGuildChannel,
	BushGuildEmoji,
	BushGuildMember,
	BushRole,
	BushUser
} from '#lib';
import type { APIInteractionGuildMember } from 'discord-api-types/v9';
import { CommandInteraction, type CacheType, type CacheTypeReducer, type Invite, type Snowflake } from 'discord.js';
import type { RawCommandInteractionData } from 'discord.js/typings/rawDataTypes';
import { BushTextBasedChannels, type BushClient } from '../discord-akairo/BushClient';

export type BushGuildResolvable = BushGuild | BushGuildChannel | BushGuildMember | BushGuildEmoji | Invite | BushRole | Snowflake;

export class BushCommandInteraction<Cached extends CacheType = CacheType> extends CommandInteraction<Cached> {
	public constructor(client: BushClient, data: RawCommandInteractionData) {
		super(client, data);
	}
	public declare readonly client: BushClient;
	public declare readonly command: BushApplicationCommand | BushApplicationCommand<{ guild: BushGuildResolvable }> | null;
	public declare readonly channel: CacheTypeReducer<Cached, BushTextBasedChannels | null>;
	public declare readonly guild: CacheTypeReducer<Cached, BushGuild, null>;
	public declare member: CacheTypeReducer<Cached, BushGuildMember, APIInteractionGuildMember>;
	public declare user: BushUser;
}
