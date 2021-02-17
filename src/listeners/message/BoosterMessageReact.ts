import { Message } from 'discord.js';
import { BotListener } from '../../extensions/BotListener';

export default class AutoResponderListener extends BotListener {
	public constructor() {
		super('AutoResponderListener', {
			emitter: 'client',
			event: 'message',
			category: 'message',
		});
	}
	public async exec(message: Message): Promise<Message> {
		if ((message.type === 'USER_PREMIUM_GUILD_SUBSCRIPTION')&&(message.guild.id === '516977525906341928')&&(message.channel.id === '784479510056665138')){
			try{ 
				message.react('<:nitroboost:785160348885975062>')
			}catch{
				return true
			}
			
		}
		
	}
}
