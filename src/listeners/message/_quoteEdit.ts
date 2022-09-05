// import { BotClientEvents, BotListener, Emitter } from '#lib';
// import { Events } from 'discord.js';

// export default class QuoteEditListener extends BotListener {
// 	public constructor() {
// 		super('quoteEdit', {
// 			emitter: Emitter.Client,
// 			event: Events.MessageUpdate
// 		});
// 	}

// 	public async exec(...[_, newMessage]: BotClientEvents[Events.MessageUpdate]) {
// 		return;
// 		// if (newMessage.partial) newMessage = await newMessage.fetch();
// 		// return new QuoteCreateListener().exec(newMessage);
// 	}
// }
