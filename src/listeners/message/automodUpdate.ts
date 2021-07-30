import { BushListener, BushMessage } from '@lib';
import { ClientEvents, Message } from 'discord.js';

export default class AutomodMessageUpdateListener extends BushListener {
	public constructor() {
		super('automodUpdate', {
			emitter: 'client',
			event: 'messageUpdate',
			category: 'message'
		});
	}

	async exec(...[message]: ClientEvents['messageUpdate']): Promise<unknown> {
		const fullMessage = message.partial ? await message.fetch() : (message as Message);
		return await util.automod(fullMessage as BushMessage);
	}
}
