import {
	type BushClient,
	type BushGuild,
	type BushGuildMember,
	type BushGuildMemberResolvable,
	type BushUser,
	type BushUserResolvable
} from '@lib';
import {
	CachedManager,
	type AddGuildMemberOptions,
	type BanOptions,
	type Collection,
	type FetchMemberOptions,
	type FetchMembersOptions,
	type GuildListMembersOptions,
	type GuildMemberEditData,
	type GuildPruneMembersOptions,
	type GuildSearchMembersOptions,
	type Snowflake
} from 'discord.js';
import { type RawGuildMemberData } from 'discord.js/typings/rawDataTypes';

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
