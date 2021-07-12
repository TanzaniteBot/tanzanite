import { Activity } from 'discord.js';
import { BushEmoji } from './BushEmoji';
import { BushPresence } from './BushPresence';

export class BushActivity extends Activity {
	public declare emoji: BushEmoji | null;
	public constructor(presence: BushPresence, data?: unknown) {
		super(presence, data);
	}
}
