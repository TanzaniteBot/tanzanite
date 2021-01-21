import { Message, MessageEmbed, TextChannel } from 'discord.js';
import AllowedMentions from '../../extensions/AllowedMentions';
import { BotListener } from '../../extensions/BotListener';

export default class AutoResponderListener extends BotListener {
	public constructor() {
		super('AutoResponderListener', {
			emitter: 'client',
			event: 'message',
			category: 'message',
		});
	}

	public async exec(message: Message): Promise<void> {
		const exemptRoles = [
			'782803470205190164', //Sr. Mod
			'737308259823910992', //Mod
			'746541309853958186', //admin perms
			'742165914148929536', //moul
			'737440116230062091' //helper
		]
		
		if (!message.guild) return;
		const generalLogChannel = <TextChannel>this.client.channels.cache.get(this.client.config.generalLogChannel);
		if (message.author.bot) return;
		if (message.content.toLowerCase().includes('broken') && !message.member?.roles.cache.some(r => exemptRoles.includes(r.id))) {
			await message.reply('Please check <#738033569666170940> for a temporary solution to fix neu.');
		} else {
			return;
		}
	}
}
