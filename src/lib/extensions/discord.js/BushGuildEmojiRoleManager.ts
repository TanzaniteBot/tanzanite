import { Collection, GuildEmojiRoleManager, Snowflake } from 'discord.js';
import { BushGuild } from './BushGuild';
import { BushGuildEmoji } from './BushGuildEmoji';
import { BushRole } from './BushRole';

export class BushGuildEmojiRoleManager extends GuildEmojiRoleManager {
	public declare emoji: BushGuildEmoji;
	public declare guild: BushGuild;
	public declare cache: Collection<Snowflake, BushRole>;
	public constructor(emoji: BushGuildEmoji) {
		super(emoji);
	}
}
