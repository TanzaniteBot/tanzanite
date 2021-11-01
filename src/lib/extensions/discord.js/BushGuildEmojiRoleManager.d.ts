import { type BushClient, type BushGuild, type BushGuildEmoji, type BushRole, type BushRoleResolvable } from '@lib';
import { DataManager, type Collection, type Snowflake } from 'discord.js';

export class BushGuildEmojiRoleManager extends DataManager<Snowflake, BushRole, BushRoleResolvable> {
	public constructor(emoji: BushGuildEmoji);
	public declare readonly client: BushClient;
	public emoji: BushGuildEmoji;
	public guild: BushGuild;
	public add(
		roleOrRoles: BushRoleResolvable | readonly BushRoleResolvable[] | Collection<Snowflake, BushRole>
	): Promise<BushGuildEmoji>;
	public set(roles: readonly BushRoleResolvable[] | Collection<Snowflake, BushRole>): Promise<BushGuildEmoji>;
	public remove(
		roleOrRoles: BushRoleResolvable | readonly BushRoleResolvable[] | Collection<Snowflake, BushRole>
	): Promise<BushGuildEmoji>;
}
