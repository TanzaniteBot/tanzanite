import { MessageReaction } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';
import { BushGuildEmoji } from './BushGuildEmoji';
import { BushMessage } from './BushMessage';
import { BushReactionEmoji } from './BushReactionEmoji';

export class BushMessageReaction extends MessageReaction {
	public readonly client: BushClient;
	public readonly emoji: BushGuildEmoji | BushReactionEmoji;

	public constructor(client: BushClient, data: unknown, message: BushMessage) {
		super(client, data, message);
	}
}
