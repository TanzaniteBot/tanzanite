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

	async exec(...[message]: ClientEvents['messageCreate']): Promise<unknown> {
		return await util.automod(message as BushMessage);
	}
}
