import type { BushClient, BushGuild, BushGuildEmojiRoleManager, BushUser } from '#lib';
import { GuildEmoji } from 'discord.js';
import type { RawGuildEmojiData } from 'discord.js/typings/rawDataTypes';

/**
 * Represents a custom emoji.
 */
export class BushGuildEmoji extends GuildEmoji {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public declare author: BushUser | null;

	public constructor(client: BushClient, data: RawGuildEmojiData, guild: BushGuild) {
		super(client, data, guild);
	}
}

export interface BushGuildEmoji {
	get roles(): BushGuildEmojiRoleManager;
}
