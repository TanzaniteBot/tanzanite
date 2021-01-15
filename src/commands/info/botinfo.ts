import { BotCommand } from '../../extensions/BotCommand';
import { Message, MessageEmbed } from 'discord.js';

export default class BotInfoCommand extends BotCommand {
	public constructor() {
		super('botinfo', {
			aliases: ['botinfo'],
			category: 'info',
			ratelimit: 4,
			cooldown: 4000,
			description: {
				content: 'Info About the bot.',
				usage: 'botinfo',
			},
		});
	}
	public async exec(message: Message): Promise<void> {
		const nice_owner_names: Array<string> = [];
		for (const id of this.client.ownerID) {
			nice_owner_names.push((await this.client.users.fetch(id)).tag);
		}
		const embed: MessageEmbed = new MessageEmbed()
			.setTitle('Bot info')
			.addField('Developers', nice_owner_names, true)
			.addField('Ping', `MSG-creation: **${Date.now() - message.createdTimestamp}ms**\n API-Latency: **${Math.round(this.client.ws.ping)}ms**`, true)
			.addField('Serving', `Serving ${this.client.users.cache.size} user's`, true)
			.addField('Prefix', `\`${message.util.parsed.prefix}\``, true)
			.setFooter(`Client ID • ${message.client.user.id}`);
		await message.util.send(embed);
	}
}
