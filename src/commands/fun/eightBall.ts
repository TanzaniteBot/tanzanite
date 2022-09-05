import { BotCommand, type CommandMessage, type SlashMessage } from '#lib';
import { ApplicationCommandOptionType } from 'discord.js';

export default class EightBallCommand extends BotCommand {
	public constructor() {
		super('eightBall', {
			aliases: ['eightball', '8ball'],
			category: 'fun',
			description: 'Ask questions for a randomly generated response.',
			usage: ['eightball <question>'],
			examples: ['eightball does anyone love me?'],
			args: [
				{
					id: 'question',
					description: 'The question to have answered.',
					type: 'string',
					match: 'rest',
					prompt: 'What question would you like answered?',
					retry: '{error} Invalid question.',
					slashType: ApplicationCommandOptionType.String
				}
			],
			slash: true,
			clientPermissions: [],
			userPermissions: []
		});
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		const responses = [
			'It is certain',
			'Without a doubt',
			'You may rely on it',
			'Yes definitely',
			'It is decidedly so',
			'As I see it, yes',
			'Most likely',
			'Yes',
			'Outlook good',
			'Signs point to yes',
			'Reply hazy try again',
			'Better not tell you now',
			'Ask again later',
			'Cannot predict now',
			'Concentrate and ask again',
			"Don't count on it",
			'Outlook not so good',
			'My sources say no',
			'Very doubtful',
			'My reply is no'
		];
		const answer = responses[Math.floor(Math.random() * responses.length)];
		await message.util.reply(answer);
	}
}
