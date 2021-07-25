import { BushListener, BushMessage } from '@lib';
import { ClientEvents } from 'discord.js';

export default class AutomodMessageCreateListener extends BushListener {
	public constructor() {
		super('automodCreate', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	async exec(...[message]: ClientEvents['messageCreate']): Promise<void> {
		return await this.client.util.automod(message as BushMessage)
	}
}
