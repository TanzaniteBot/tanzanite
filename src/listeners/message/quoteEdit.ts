// import { BushListener, type BushClientEvents } from '#lib';

// export default class QuoteEditListener extends BushListener {
// 	public constructor() {
// 		super('quoteEdit', {
// 			emitter: 'client',
// 			event: 'messageUpdate',
// 			category: 'message'
// 		});
// 	}

// 	public async exec(...[_, newMessage]: BushClientEvents['messageUpdate']) {
// 		return;
// 		// if (newMessage.partial) newMessage = await newMessage.fetch();
// 		// return new QuoteCreateListener().exec(newMessage);
// 	}
// }
