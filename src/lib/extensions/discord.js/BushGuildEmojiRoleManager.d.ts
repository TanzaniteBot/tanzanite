import type { BushClient, BushGuild, BushGuildEmoji, BushRole, BushRoleResolvable } from '#lib';
import { DataManager, type Collection, type Snowflake } from 'discord.js';

/**
 * Manages API methods for roles belonging to emojis and stores their cache.
 */
export class BushGuildEmojiRoleManager extends DataManager<Snowflake, BushRole, BushRoleResolvable> {
	public constructor(emoji: BushGuildEmoji);
	public declare readonly client: BushClient;

	/**
	 * The emoji belonging to this manager
	 */
	public emoji: BushGuildEmoji;

	/**
	 * The guild belonging to this manager
	 */
	public guild: BushGuild;

	/**
	 * Adds a role (or multiple roles) to the list of roles that can use this emoji.
	 * @param roleOrRoles The role or roles to add
	 */
	public add(
		roleOrRoles: BushRoleResolvable | readonly BushRoleResolvable[] | Collection<Snowflake, BushRole>
	): Promise<BushGuildEmoji>;

	/**
	 * Sets the role(s) that can use this emoji.
	 * @param roles The roles or role ids to apply
	 * @example
	 * // Set the emoji's roles to a single role
	 * guildEmoji.roles.set(['391156570408615936'])
	 *   .then(console.log)
	 *   .catch(console.error);
	 * @example
	 * // Remove all roles from an emoji
	 * guildEmoji.roles.set([])
	 *    .then(console.log)
	 *    .catch(console.error);
	 */
	public set(roles: readonly BushRoleResolvable[] | Collection<Snowflake, BushRole>): Promise<BushGuildEmoji>;

	/**
	 * Removes a role (or multiple roles) from the list of roles that can use this emoji.
	 * @param roleOrRoles The role or roles to remove
	 */
	public remove(
		roleOrRoles: BushRoleResolvable | readonly BushRoleResolvable[] | Collection<Snowflake, BushRole>
	): Promise<BushGuildEmoji>;
}
