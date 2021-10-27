import { APIInteractionGuildMember } from 'discord-api-types/v9';
import { CacheType, CacheTypeReducer, CommandInteraction, Invite, Snowflake } from 'discord.js';
import { RawCommandInteractionData } from 'discord.js/typings/rawDataTypes';
import { BushClient, BushTextBasedChannels } from '../discord-akairo/BushClient';
import { BushApplicationCommand } from './BushApplicationCommand';
import { BushGuild } from './BushGuild';
import { BushGuildChannel } from './BushGuildChannel';
import { BushGuildEmoji } from './BushGuildEmoji';
import { BushGuildMember } from './BushGuildMember';
import { BushRole } from './BushRole';
import { BushUser } from './BushUser';

export type BushGuildResolvable = BushGuild | BushGuildChannel | BushGuildMember | BushGuildEmoji | Invite | BushRole | Snowflake;

export class BushCommandInteraction<Cached extends CacheType = CacheType> extends CommandInteraction<Cached> {
	public constructor(client: BushClient, data: RawCommandInteractionData) {
		super(client, data);
	}
	public declare readonly client: BushClient;
	public declare readonly command: BushApplicationCommand | BushApplicationCommand<{ guild: BushGuildResolvable }> | null;
	public declare readonly channel: BushTextBasedChannels | null;
	public declare readonly guild: CacheTypeReducer<Cached, BushGuild, null>;
	public declare member: CacheTypeReducer<Cached, BushGuildMember, APIInteractionGuildMember>;
	public declare user: BushUser;
}
