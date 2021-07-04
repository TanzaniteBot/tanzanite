import { MessageReaction } from 'discord.js';
import { BushClient, BushGuildEmoji, BushMessage, BushReactionEmoji } from '..';

export class BushMessageReaction extends MessageReaction {
	public readonly client: BushClient;
	public readonly emoji: BushGuildEmoji | BushReactionEmoji;

	public constructor(client: BushClient, data: unknown, message: BushMessage) {
		super(client, data, message);
	}
}
