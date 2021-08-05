import { Emoji } from 'discord.js';
import { RawEmojiData } from 'discord.js/typings/rawDataTypes';
import { BushClient } from '../discord-akairo/BushClient';

export class BushEmoji extends Emoji {
	public declare readonly client: BushClient;
	public constructor(client: BushClient, emoji: RawEmojiData) {
		super(client, emoji);
	}
}
