import type { BushClient, BushThreadChannel, BushThreadMember, BushThreadMemberResolvable } from '#lib';
import { CachedManager, type BaseFetchOptions, type Collection, type Snowflake, type UserResolvable } from 'discord.js';
import type { RawThreadMemberData } from 'discord.js/typings/rawDataTypes';

export class BushThreadMemberManager extends CachedManager<Snowflake, BushThreadMember, BushThreadMemberResolvable> {
	public constructor(thread: BushThreadChannel, iterable?: Iterable<RawThreadMemberData>);
	public declare readonly client: BushClient;
	public thread: BushThreadChannel;
	public add(member: UserResolvable | '@me', reason?: string): Promise<Snowflake>;
	public fetch(member?: UserResolvable, options?: BaseFetchOptions): Promise<BushThreadMember>;
	/** @deprecated Use `fetch(member, options)` instead. */
	public fetch(cache?: boolean): Promise<Collection<Snowflake, BushThreadMember>>;
	public remove(id: Snowflake | '@me', reason?: string): Promise<Snowflake>;
}
