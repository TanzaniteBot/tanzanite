import type { BushClient, BushGuild, BushGuildMember, BushGuildMemberResolvable, BushUser, BushUserResolvable } from '#lib';
import {
	CachedManager,
	GuildMemberManager,
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
import type { RawGuildMemberData } from 'discord.js/typings/rawDataTypes';

/**
 * Manages API methods for GuildMembers and stores their cache.
 */
export declare class BushGuildMemberManager
	extends CachedManager<Snowflake, BushGuildMember, BushGuildMemberResolvable>
	implements GuildMemberManager
{
	public constructor(guild: BushGuild, iterable?: Iterable<RawGuildMemberData>);
	public declare readonly client: BushClient;

	/**
	 * The guild this manager belongs to
	 */
	public guild: BushGuild;

	/**
	 * Adds a user to the guild using OAuth2. Requires the `PermissionFlagsBits.CreateInstantInvite` permission.
	 * @param user The user to add to the guild
	 * @param options Options for adding the user to the guild
	 */
	public add(
		user: BushUserResolvable,
		options: AddGuildMemberOptions & { fetchWhenExisting: false }
	): Promise<BushGuildMember | null>;
	public add(user: BushUserResolvable, options: AddGuildMemberOptions): Promise<BushGuildMember>;

	/**
	 * Bans a user from the guild.
	 * @param user The user to ban
	 * @param options Options for the ban
	 * @returns Result object will be resolved as specifically as possible.
	 * If the GuildMember cannot be resolved, the User will instead be attempted to be resolved. If that also cannot
	 * be resolved, the user id will be the result.
	 * Internally calls the GuildBanManager#create method.
	 * @example
	 * // Ban a user by id (or with a user/guild member object)
	 * guild.members.ban('84484653687267328')
	 *   .then(kickInfo => console.log(`Banned ${kickInfo.user?.tag ?? kickInfo.tag ?? kickInfo}`))
	 *   .catch(console.error);
	 */
	public ban(user: BushUserResolvable, options?: BanOptions): Promise<BushGuildMember | BushUser | Snowflake>;

	/**
	 * Edits a member of the guild.
	 * <info>The user must be a member of the guild</info>
	 * @param user The member to edit
	 * @param data The data to edit the member with
	 * @param reason Reason for editing this user
	 */
	public edit(user: BushUserResolvable, data: GuildMemberEditData, reason?: string): Promise<void>;

	/**
	 * Fetches member(s) from Discord, even if they're offline.
	 * @param options If a UserResolvable, the user to fetch.
	 * If undefined, fetches all members.
	 * If a query, it limits the results to users with similar usernames.
	 * @example
	 * // Fetch all members from a guild
	 * guild.members.fetch()
	 *   .then(console.log)
	 *   .catch(console.error);
	 * @example
	 * // Fetch a single member
	 * guild.members.fetch('66564597481480192')
	 *   .then(console.log)
	 *   .catch(console.error);
	 * @example
	 * // Fetch a single member without checking cache
	 * guild.members.fetch({ user, force: true })
	 *   .then(console.log)
	 *   .catch(console.error)
	 * @example
	 * // Fetch a single member without caching
	 * guild.members.fetch({ user, cache: false })
	 *   .then(console.log)
	 *   .catch(console.error);
	 * @example
	 * // Fetch by an array of users including their presences
	 * guild.members.fetch({ user: ['66564597481480192', '191615925336670208'], withPresences: true })
	 *   .then(console.log)
	 *   .catch(console.error);
	 * @example
	 * // Fetch by query
	 * guild.members.fetch({ query: 'hydra', limit: 1 })
	 *   .then(console.log)
	 *   .catch(console.error);
	 */
	public fetch(
		options: BushUserResolvable | FetchMemberOptions | (FetchMembersOptions & { user: BushUserResolvable })
	): Promise<BushGuildMember>;
	public fetch(options?: FetchMembersOptions): Promise<Collection<Snowflake, BushGuildMember>>;

	/**
	 * Kicks a user from the guild.
	 * <info>The user must be a member of the guild</info>
	 * @param user The member to kick
	 * @param reason Reason for kicking
	 * @returns Result object will be resolved as specifically as possible.
	 * If the GuildMember cannot be resolved, the User will instead be attempted to be resolved. If that also cannot
	 * be resolved, the user's id will be the result.
	 * @example
	 * // Kick a user by id (or with a user/guild member object)
	 * guild.members.kick('84484653687267328')
	 *   .then(banInfo => console.log(`Kicked ${banInfo.user?.tag ?? banInfo.tag ?? banInfo}`))
	 *   .catch(console.error);
	 */
	public kick(user: BushUserResolvable, reason?: string): Promise<BushGuildMember | BushUser | Snowflake>;

	/**
	 * Lists up to 1000 members of the guild.
	 * @param options Options for listing members
	 */
	public list(options?: GuildListMembersOptions): Promise<Collection<Snowflake, BushGuildMember>>;

	/**
	 * Prunes members from the guild based on how long they have been inactive.
	 * @param options Options for pruning
	 * @returns The number of members that were/will be kicked
	 * @example
	 * // See how many members will be pruned
	 * guild.members.prune({ dry: true })
	 *   .then(pruned => console.log(`This will prune ${pruned} people!`))
	 *   .catch(console.error);
	 * @example
	 * // Actually prune the members
	 * guild.members.prune({ days: 1, reason: 'too many people!' })
	 *   .then(pruned => console.log(`I just pruned ${pruned} people!`))
	 *   .catch(console.error);
	 * @example
	 * // Include members with a specified role
	 * guild.members.prune({ days: 7, roles: ['657259391652855808'] })
	 *    .then(pruned => console.log(`I just pruned ${pruned} people!`))
	 *    .catch(console.error);
	 */
	public prune(options: GuildPruneMembersOptions & { dry?: false; count: false }): Promise<null>;
	public prune(options?: GuildPruneMembersOptions): Promise<number>;

	/**
	 * Searches for members in the guild based on a query.
	 * @param options Options for searching members
	 */
	public search(options: GuildSearchMembersOptions): Promise<Collection<Snowflake, BushGuildMember>>;

	/**
	 * Unbans a user from the guild. Internally calls the {@link GuildBanManager.remove} method.
	 * @param user The user to unban
	 * @param reason Reason for unbanning user
	 * @returns The user that was unbanned
	 * @example
	 * // Unban a user by id (or with a user/guild member object)
	 * guild.members.unban('84484653687267328')
	 *   .then(user => console.log(`Unbanned ${user.username} from ${guild.name}`))
	 *   .catch(console.error);
	 */
	public unban(user: BushUserResolvable, reason?: string): Promise<BushUser>;
}
