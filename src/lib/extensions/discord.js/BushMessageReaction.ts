import type { BushClient, BushGuildEmoji, BushMessage, BushReactionEmoji } from '#lib';
import { MessageReaction, type Partialize } from 'discord.js';
import type { RawMessageReactionData } from 'discord.js/typings/rawDataTypes';

export type PartialBushMessageReaction = Partialize<BushMessageReaction, 'count'>;

export class BushMessageReaction extends MessageReaction {
	public declare readonly client: BushClient;
	public declare readonly emoji: BushGuildEmoji | BushReactionEmoji;

	public constructor(client: BushClient, data: RawMessageReactionData, message: BushMessage) {
		super(client, data, message);
	}
}
