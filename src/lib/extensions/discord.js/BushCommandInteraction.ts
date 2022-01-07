import type {
	BushApplicationCommand,
	BushClient,
	BushGuild,
	BushGuildEmoji,
	BushGuildMember,
	BushGuildTextBasedChannel,
	BushNonThreadGuildBasedChannel,
	BushRole,
	BushTextBasedChannel,
	BushUser
} from '#lib';
import type { APIInteractionGuildMember } from '@discordjs/builders/node_modules/discord-api-types';
import { CommandInteraction, type CacheType, type CacheTypeReducer, type Invite, type Snowflake } from 'discord.js';
import type { RawCommandInteractionData } from 'discord.js/typings/rawDataTypes';

export type BushGuildResolvable =
	| BushGuild
	| BushNonThreadGuildBasedChannel
	| BushGuildMember
	| BushGuildEmoji
	| Invite
	| BushRole
	| Snowflake;

/**
 * Represents a command interaction.
 */
export class BushCommandInteraction<Cached extends CacheType = CacheType> extends CommandInteraction<Cached> {
	public declare readonly client: BushClient;
	public declare readonly command: BushApplicationCommand | BushApplicationCommand<{ guild: BushGuildResolvable }> | null;
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

	public constructor(client: BushClient, data: RawCommandInteractionData) {
		super(client, data);
	}
}
