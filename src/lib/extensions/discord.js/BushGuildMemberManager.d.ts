/* eslint-disable @typescript-eslint/no-explicit-any */
import {
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
	User,
	UserResolvable
} from 'discord.js';
import { BushClient, BushGuildMemberResolvable, BushUserResolvable } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildMember } from './BushGuildMember';

export class BushGuildMemberManager extends CachedManager<Snowflake, BushGuildMember, BushGuildMemberResolvable> {
	public constructor(guild: BushGuild, iterable?: Iterable<unknown>);
	public declare readonly client: BushClient;
	public guild: BushGuild;
	public ban(user: BushUserResolvable, options?: BanOptions): Promise<GuildMember | User | Snowflake>;
	public edit(user: BushUserResolvable, data: GuildMemberEditData, reason?: string): Promise<void>;
	public fetch(
		options: UserResolvable | FetchMemberOptions | (FetchMembersOptions & { user: UserResolvable })
	): Promise<GuildMember>;
	public fetch(options?: FetchMembersOptions): Promise<Collection<Snowflake, GuildMember>>;
	public kick(user: UserResolvable, reason?: string): Promise<BushGuildMember | User | Snowflake>;
	public prune(options: GuildPruneMembersOptions & { dry?: false; count: false }): Promise<null>;
	public prune(options?: GuildPruneMembersOptions): Promise<number>;
	public search(options: GuildSearchMembersOptions): Promise<Collection<Snowflake, GuildMember>>;
	public unban(user: UserResolvable, reason?: string): Promise<User>;
}
