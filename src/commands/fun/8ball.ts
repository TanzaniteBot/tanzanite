import { BotCommand } from '../../classes/BotCommand'
import { Message } from 'discord.js'

export default class EightBallCommand extends BotCommand {
	public constructor() {
		super('8Ball', {
			aliases: ['8Ball', 'EightBall'],
			category: 'fun',
			description: {
				content: 'Ask questions for a randomly generated response.',
				usage: '8Ball <question>',
				examples: [
					'8Ball Does anyone love me?'
				],
			},
			args : [
				{
					id: 'question',
					type: 'string',
					prompt: {
						start: 'What question would you like answered?'
					},	
				}
			],
			channel: 'guild'
		})
	}
	public async exec(message: Message, {question}: {question: string}): Promise<void> {		
		if (question.includes('ironm00n')){
			message.util.send('Don\'t ask questions about IRONM00N.')
			return
		}else{
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
				'Don\'t count on it',
				'Outlook not so good',
				'My sources say no',
				'Very doubtful',
				'My reply is no'
			]
			const answer = responses[Math.floor(Math.random() * responses.length)]
			message.util.send(answer)
		}
	}
}

