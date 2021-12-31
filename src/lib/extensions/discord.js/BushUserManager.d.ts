import type { BushClient, BushDMChannel, BushUser, BushUserResolvable } from '#lib';
import {
	CachedManager,
	Message,
	MessageOptions,
	MessagePayload,
	UserFlags,
	type BaseFetchOptions,
	type Snowflake
} from 'discord.js';
import type { RawUserData } from 'discord.js/typings/rawDataTypes';

/**
 * Manages API methods for users and stores their cache.
 */
export class BushUserManager extends CachedManager<Snowflake, BushUser, BushUserResolvable> {
	private constructor(client: BushClient, iterable?: Iterable<RawUserData>);

	/**
	 * The DM between the client's user and a user
	 * @param userId The user id
	 * @private
	 */
	public dmChannel(userId: Snowflake): BushDMChannel | null;

	/**
	 * Creates a {@link DMChannel} between the client and a user.
	 * @param user The UserResolvable to identify
	 * @param options Additional options for this fetch
	 */
	public createDM(user: BushUserResolvable, options?: BaseFetchOptions): Promise<BushDMChannel>;

	/**
	 * Deletes a {@link DMChannel} (if one exists) between the client and a user. Resolves with the channel if successful.
	 * @param user The UserResolvable to identify
	 */
	public deleteDM(user: BushUserResolvable): Promise<BushDMChannel>;

	/**
	 * Obtains a user from Discord, or the user cache if it's already available.
	 * @param user The user to fetch
	 * @param options Additional options for this fetch
	 */
	public fetch(user: BushUserResolvable, options?: BaseFetchOptions): Promise<BushUser>;

	/**
	 * Fetches a user's flags.
	 * @param user The UserResolvable to identify
	 * @param options Additional options for this fetch
	 */
	public fetchFlags(user: BushUserResolvable, options?: BaseFetchOptions): Promise<UserFlags>;

	/**
	 * Sends a message to a user.
	 * @param user The UserResolvable to identify
	 * @param options The options to provide
	 */
	public send(user: BushUserResolvable, options: string | MessagePayload | MessageOptions): Promise<Message>;
}
