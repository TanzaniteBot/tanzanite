import {
	AddGuildMemberOptions,
	BanOptions,
	CachedManager,
	Collection,
	FetchMemberOptions,
	FetchMembersOptions,
	GuildListMembersOptions,
	GuildMemberEditData,
	GuildPruneMembersOptions,
	GuildSearchMembersOptions,
	Snowflake
} from 'discord.js';
import { RawGuildMemberData } from 'discord.js/typings/rawDataTypes';
import { BushClient, BushGuildMemberResolvable, BushUserResolvable } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';
import { BushUser } from './BushUser';

export class BushGuildMemberManager extends CachedManager<Snowflake, BushGuildMember, BushGuildMemberResolvable> {
	public constructor(guild: BushGuild, iterable?: Iterable<RawGuildMemberData>);
	public declare readonly client: BushClient;
	public guild: BushGuild;
	public add(
		user: BushUserResolvable,
		options: AddGuildMemberOptions & { fetchWhenExisting: false }
	): Promise<BushGuildMember | null>;
	public add(user: BushUserResolvable, options: AddGuildMemberOptions): Promise<BushGuildMember>;
	public ban(user: BushUserResolvable, options?: BanOptions): Promise<BushGuildMember | BushUser | Snowflake>;
	public edit(user: BushUserResolvable, data: GuildMemberEditData, reason?: string): Promise<void>;
	public fetch(
		options: BushUserResolvable | FetchMemberOptions | (FetchMembersOptions & { user: BushUserResolvable })
	): Promise<BushGuildMember>;
	public fetch(options?: FetchMembersOptions): Promise<Collection<Snowflake, BushGuildMember>>;
	public kick(user: BushUserResolvable, reason?: string): Promise<BushGuildMember | BushUser | Snowflake>;
	public list(options?: GuildListMembersOptions): Promise<Collection<Snowflake, BushGuildMember>>;
	public prune(options: GuildPruneMembersOptions & { dry?: false; count: false }): Promise<null>;
	public prune(options?: GuildPruneMembersOptions): Promise<number>;
	public search(options: GuildSearchMembersOptions): Promise<Collection<Snowflake, BushGuildMember>>;
	public unban(user: BushUserResolvable, reason?: string): Promise<BushUser>;
}
