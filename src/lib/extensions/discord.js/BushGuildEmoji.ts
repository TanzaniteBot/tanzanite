import { GuildEmoji } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuild } from './BushGuild';
import { BushGuildEmojiRoleManager } from './BushGuildEmojiRoleManager';
import { BushUser } from './BushUser';

export class BushGuildEmoji extends GuildEmoji {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public declare author: BushUser | null;
	public declare readonly roles: BushGuildEmojiRoleManager;
	public constructor(client: BushClient, data: unknown, guild: BushGuild) {
		super(client, data, guild);
	}
}
