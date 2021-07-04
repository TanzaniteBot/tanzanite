import { GuildEmoji } from 'discord.js';
import { BushClient, BushGuild, BushGuildEmojiRoleManager, BushUser } from '..';

export class BushGuildEmoji extends GuildEmoji {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public declare author: BushUser | null;
	public declare readonly roles: BushGuildEmojiRoleManager;
	public constructor(client: BushClient, data: unknown, guild: BushGuild) {
		super(client, data, guild);
	}
}
