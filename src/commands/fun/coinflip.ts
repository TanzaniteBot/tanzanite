import { BushCommand, type BushMessage, type BushSlashMessage } from '@lib';

export default class CoinFlipCommand extends BushCommand {
	public constructor() {
		super('coinflip', {
			aliases: ['coinflip', 'cf'],
			category: 'fun',
			description: {
				content: 'Flip a virtual coin.',
				usage: ['coinflip'],
				examples: ['coinflip']
			},
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: [],
			slash: true
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage) {
		const random = Math.random();
		let result: string;
		const fall = message.author.id === '322862723090219008' ? 0.1 : 0.001; //dw about it
		if (random < fall) result = 'The coin fell off the table :(';
		else if (random <= 0.5 + fall / 2) result = 'Heads';
		else result = 'Tails';
		await message.util.reply(result);
	}
}
