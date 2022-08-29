// import { CustomListener, type CustomClientEvents } from '#lib';

// export default class QuoteEditListener extends CustomListener {
// 	public constructor() {
// 		super('quoteEdit', {
// 			emitter: 'client',
// 			event: 'messageUpdate',
// 		});
// 	}

// 	public async exec(...[_, newMessage]: CustomClientEvents['messageUpdate']) {
// 		return;
// 		// if (newMessage.partial) newMessage = await newMessage.fetch();
// 		// return new QuoteCreateListener().exec(newMessage);
// 	}
// }
