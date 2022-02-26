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
import type { APIInteractionGuildMember } from 'discord-api-types/v9';
import { ChatInputCommandInteraction, type CacheType, type CacheTypeReducer, type Invite, type Snowflake } from 'discord.js';
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
export class BushChatInputCommandInteraction<Cached extends CacheType = CacheType> extends ChatInputCommandInteraction<Cached> {
	public declare readonly client: BushClient;
	public declare member: CacheTypeReducer<Cached, BushGuildMember, APIInteractionGuildMember>;
	public declare user: BushUser;

	public constructor(client: BushClient, data: RawCommandInteractionData) {
		super(client, data);
	}
}

export interface BushChatInputCommandInteraction<Cached extends CacheType = CacheType> {
	get command(): BushApplicationCommand | BushApplicationCommand<{ guild: BushGuildResolvable }> | null;
	get channel(): CacheTypeReducer<
		Cached,
		BushGuildTextBasedChannel | null,
		BushGuildTextBasedChannel | null,
		BushGuildTextBasedChannel | null,
		BushTextBasedChannel | null
	>;
	get guild(): CacheTypeReducer<Cached, BushGuild, null>;
}
