import type { BushClient, BushThreadChannel, BushThreadMember, BushThreadMemberResolvable } from '#lib';
import { CachedManager, type BaseFetchOptions, type Collection, type Snowflake, type UserResolvable } from 'discord.js';
import type { RawThreadMemberData } from 'discord.js/typings/rawDataTypes';

/**
 * Manages API methods for GuildMembers and stores their cache.
 */
export class BushThreadMemberManager extends CachedManager<Snowflake, BushThreadMember, BushThreadMemberResolvable> {
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
	 * Fetches member(s) for the thread from Discord, requires access to the `GUILD_MEMBERS` gateway intent.
	 * @param member The member to fetch. If `undefined`, all members in the thread are fetched, and will be
	 * cached based on `options.cache`. If boolean, this serves the purpose of `options.cache`.
	 * @param options Additional options for this fetch
	 */
	public fetch(member?: UserResolvable, options?: BaseFetchOptions): Promise<BushThreadMember>;

	/**
	 * @deprecated Use `fetch(member, options)` instead.
	 */
	public fetch(cache?: boolean): Promise<Collection<Snowflake, BushThreadMember>>;

	/**
	 * Remove a user from the thread.
	 * @param id The id of the member to remove
	 * @param reason The reason for removing this member from the thread
	 */
	public remove(id: Snowflake | '@me', reason?: string): Promise<Snowflake>;
}
