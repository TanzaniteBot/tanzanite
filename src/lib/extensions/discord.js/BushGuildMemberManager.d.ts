/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	AddGuildMemberOptions,
	BanOptions,
	CachedManager,
	Collection,
	FetchMemberOptions,
	FetchMembersOptions,
	GuildMember,
	GuildMemberEditData,
	GuildPruneMembersOptions,
	GuildSearchMembersOptions,
	Snowflake,
	User
} from 'discord.js';
import { BushClient, BushGuildMemberResolvable, BushUserResolvable } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';

export class BushGuildMemberManager extends CachedManager<Snowflake, BushGuildMember, BushGuildMemberResolvable> {
	public constructor(guild: BushGuild, iterable?: Iterable<unknown>);
	public declare readonly client: BushClient;
	public guild: BushGuild;
	public add(
		user: BushUserResolvable,
		options: AddGuildMemberOptions & { fetchWhenExisting: false }
	): Promise<GuildMember | null>;
	public add(user: BushUserResolvable, options: AddGuildMemberOptions): Promise<GuildMember>;
	public ban(user: BushUserResolvable, options?: BanOptions): Promise<GuildMember | User | Snowflake>;
	public edit(user: BushUserResolvable, data: GuildMemberEditData, reason?: string): Promise<void>;
	public fetch(
		options: BushUserResolvable | FetchMemberOptions | (FetchMembersOptions & { user: BushUserResolvable })
	): Promise<GuildMember>;
	public fetch(options?: FetchMembersOptions): Promise<Collection<Snowflake, GuildMember>>;
	public kick(user: BushUserResolvable, reason?: string): Promise<BushGuildMember | User | Snowflake>;
	public prune(options: GuildPruneMembersOptions & { dry?: false; count: false }): Promise<null>;
	public prune(options?: GuildPruneMembersOptions): Promise<number>;
	public search(options: GuildSearchMembersOptions): Promise<Collection<Snowflake, GuildMember>>;
	public unban(user: BushUserResolvable, reason?: string): Promise<User>;
}
