import { Collection, DataManager, Snowflake } from 'discord.js';
import { BushClient, BushRoleResolvable } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildEmoji } from './BushGuildEmoji';
import { BushRole } from './BushRole';

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
