/* import { BushInhibitor } from '../../lib/extensions/BushInhibitor';
import { Message } from 'discord.js';

export default class TestInhibitor extends BushInhibitor {
	constructor() {
		super('testInhibitor', {
			reason: 'testInhibitor',
		});
	}

	public async exec(message: Message): Promise<boolean> {
		if (this.client.config.environment != 'development') return false
		if (message.author.id === '322862723090219008') {
			await message.react('🍩');
			return true;
		}
	}
}
 */