import { AllIntegrationTypes, AllInteractionContexts, BotCommand, type CommandMessage, type SlashMessage } from '#lib';

export default class CoinFlipCommand extends BotCommand {
	public constructor() {
		super('coinFlip', {
			aliases: ['coin-flip', 'cf'],
			category: 'fun',
			description: 'Flip a virtual coin.',
			usage: ['coinflip'],
			examples: ['coinflip'],
			clientPermissions: [],
			userPermissions: [],
			slash: true,
			slashContexts: AllInteractionContexts,
			slashIntegrationTypes: AllIntegrationTypes
		});
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		const random = Math.random();
		let result: string;
		const fall = message.author.id === '322862723090219008' ? 0.1 : 0.001; //dw about it
		if (random < fall) result = 'The coin fell off the table :(';
		else if (random <= 0.5 + fall / 2) result = 'Heads';
		else result = 'Tails';
		await message.util.reply(result);
	}
}
