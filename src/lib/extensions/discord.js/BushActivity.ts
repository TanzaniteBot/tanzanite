import { Activity } from 'discord.js';
import { BushEmoji, BushPresence } from '..';

export class BushActivity extends Activity {
	public emoji: BushEmoji | null;
	public constructor(presence: BushPresence, data?: unknown) {
		super(presence, data);
	}
}
