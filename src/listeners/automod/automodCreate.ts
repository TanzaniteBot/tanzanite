import { BotListener, Emitter, MessageAutomod, type BotClientEvents } from '#lib';
import { Events } from 'discord.js';

export default class AutomodMessageCreateListener extends BotListener {
	public constructor() {
		super('automodCreate', {
			emitter: Emitter.Client,
			event: Events.MessageCreate
		});
	}

	public exec(...[message]: BotClientEvents[Events.MessageCreate]) {
		if (message.member === null) return;
		return new MessageAutomod(message);
	}
}
