import type { BushClient, BushThreadChannel, BushThreadMember, BushThreadMemberResolvable, BushUserResolvable } from '#lib';
import {
	CachedManager,
	ThreadMemberManager,
	type BaseFetchOptions,
	type Collection,
	type Snowflake,
	type UserResolvable
} from 'discord.js';
import type { RawThreadMemberData } from 'discord.js/typings/rawDataTypes';

/**
 * Manages API methods for GuildMembers and stores their cache.
 */
export declare class BushThreadMemberManager
	extends CachedManager<Snowflake, BushThreadMember, BushThreadMemberResolvable>
	implements ThreadMemberManager
{
	public constructor(thread: BushThreadChannel, iterable?: Iterable<RawThreadMemberData>);
	public declare readonly client: BushClient;

	/**
	 * The thread this manager belongs to
	 */
	public thread: BushThreadChannel;

	/**
	 * Adds a member to the thread.
	 * @param member The member to add
	 * @param reason The reason for adding this member
	 */
	public add(member: UserResolvable | '@me', reason?: string): Promise<Snowflake>;

	/**
	 * Fetches member(s) for the thread from Discord, requires access to the `GatewayIntentBits.GuildMembers` gateway intent.
	 * @param options Additional options for this fetch, when a `boolean` is provided
	 * all members are fetched with `options.cache` set to the boolean value
	 */
	public fetch(options?: BushThreadMemberFetchOptions): Promise<BushThreadMember>;
	public fetch(cache?: boolean): Promise<Collection<Snowflake, BushThreadMember>>;

	/**
	 * Remove a user from the thread.
	 * @param id The id of the member to remove
	 * @param reason The reason for removing this member from the thread
	 */
	public remove(id: Snowflake | '@me', reason?: string): Promise<Snowflake>;
}

export interface BushThreadMemberManager extends CachedManager<Snowflake, BushThreadMember, BushThreadMemberResolvable> {
	/**
	 * The client user as a ThreadMember of this ThreadChannel
	 */
	get me(): BushThreadMember | null;
}

export interface BushThreadMemberFetchOptions extends BaseFetchOptions {
	/**
	 * The specific user to fetch from the thread
	 */
	member?: BushUserResolvable;
}
