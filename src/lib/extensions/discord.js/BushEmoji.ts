import { Emoji } from 'discord.js';
import { BushClient } from '../discord-akairo/BushClient';

export class BushEmoji extends Emoji {
	public declare readonly client: BushClient;
	public constructor(client: BushClient, emoji: unknown) {
		super(client, emoji);
	}
}
