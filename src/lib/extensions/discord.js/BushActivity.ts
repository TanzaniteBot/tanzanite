import { Activity } from 'discord.js';
import { RawActivityData } from 'discord.js/typings/rawDataTypes';
import { BushEmoji } from './BushEmoji';
import { BushPresence } from './BushPresence';

export class BushActivity extends Activity {
	public declare emoji: BushEmoji | null;
	public constructor(presence: BushPresence, data?: RawActivityData) {
		super(presence, data);
	}
}
