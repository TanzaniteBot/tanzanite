import type {
	ActivityOptions,
	Base64Resolvable,
	BufferResolvable,
	ClientPresence,
	ClientUser,
	ClientUserEditData,
	PresenceData,
	PresenceStatusData
} from 'discord.js';
import { BushUser } from './BushUser';

/**
 * Represents the logged in client's Discord user.
 */
export class BushClientUser extends BushUser implements ClientUser {
	/**
	 * If the bot's {@link ClientApplication.owner Owner} has MFA enabled on their account
	 */
	public mfaEnabled: boolean;

	/**
	 * Represents the client user's presence
	 */
	public readonly presence: ClientPresence;

	/**
	 * Whether or not this account has been verified
	 */
	public verified: boolean;

	/**
	 * Edits the logged in client.
	 * @param data The new data
	 */
	public edit(data: ClientUserEditData): Promise<this>;

	/**
	 * Sets the activity the client user is playing.
	 * @param name Activity being played, or options for setting the activity
	 * @param options Options for setting the activity
	 * @example
	 * // Set the client user's activity
	 * client.user.setActivity('discord.js', { type: 'WATCHING' });
	 */
	public setActivity(options?: ActivityOptions): ClientPresence;
	public setActivity(name: string, options?: ActivityOptions): ClientPresence;

	/**
	 * Sets/removes the AFK flag for the client user.
	 * @param afk Whether or not the user is AFK
	 * @param shardId Shard Id(s) to have the AFK flag set on
	 */
	public setAFK(afk: boolean, shardId?: number | number[]): ClientPresence;

	/**
	 * Sets the avatar of the logged in client.
	 * @param avatar The new avatar
	 * @example
	 * // Set avatar
	 * client.user.setAvatar('./avatar.png')
	 *   .then(user => console.log(`New avatar set!`))
	 *   .catch(console.error);
	 */
	public setAvatar(avatar: BufferResolvable | Base64Resolvable | null): Promise<this>;

	/**
	 * Sets the full presence of the client user.
	 * @param data Data for the presence
	 * @example
	 * // Set the client user's presence
	 * client.user.setPresence({ activities: [{ name: 'with discord.js' }], status: 'idle' });
	 */
	public setPresence(data: PresenceData): ClientPresence;

	/**
	 * Sets the status of the client user.
	 * @param status Status to change to
	 * @param shardId Shard id(s) to have the activity set on
	 * @example
	 * // Set the client user's status
	 * client.user.setStatus('idle');
	 */
	public setStatus(status: PresenceStatusData, shardId?: number | number[]): ClientPresence;

	/**
	 * Sets the username of the logged in client.
	 * <info>Changing usernames in Discord is heavily rate limited, with only 2 requests
	 * every hour. Use this sparingly!</info>
	 * @param username The new username
	 * @example
	 * // Set username
	 * client.user.setUsername('discordjs')
	 *   .then(user => console.log(`My new username is ${user.username}`))
	 *   .catch(console.error);
	 */
	public setUsername(username: string): Promise<this>;
}
