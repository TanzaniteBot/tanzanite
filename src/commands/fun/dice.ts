import { BushCommand, type BushMessage, type BushSlashMessage } from '@lib';

export default class EightBallCommand extends BushCommand {
	public constructor() {
		super('dice', {
			aliases: ['dice', 'die'],
			category: 'fun',
			description: {
				content: 'Roll virtual dice.',
				usage: ['dice'],
				examples: ['dice']
			},
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: [],
			slash: true
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage) {
		const responses = ['1', '2', '3', '4', '5', '6'];
		const answer = responses[Math.floor(Math.random() * responses.length)];
		return await message.util.reply(`You rolled a **${answer}**.`);
	}
}
