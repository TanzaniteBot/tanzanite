import { BotCommand } from '../../classes/BotCommand'
import { Message } from 'discord.js'

export default class TestCommand extends BotCommand {
	public constructor() {
		super('test', {
			aliases: ['test'],
			category: 'owner',
			description: {
				content: 'A command to test shit',
				usage: 'test',
				examples: [
					'test'
				],
			},
			ownerOnly: true
		})
	}
	public async exec(message: Message): Promise<void> {
		/*try{
			const pos = await message.guild.roles.cache.get('792942957170524160').rawPosition
			console.log('pos = ' + pos)
			const pos1 = pos + 1
			console.log('pos1 = ' + pos1)
		}catch(e){
			message.channel.startTyping()
			await message.channel.send('oops')
			message.channel.stopTyping()
		}*/
		message.util.send('test')
	}
}