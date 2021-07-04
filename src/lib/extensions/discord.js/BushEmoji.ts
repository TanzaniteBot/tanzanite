import { Emoji } from 'discord.js';
import { BushClient } from '..';

export class BushEmoji extends Emoji {
	public declare readonly client: BushClient;
	public constructor(client: BushClient, emoji: unknown) {
		super(client, emoji);
	}
}
