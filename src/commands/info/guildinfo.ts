import { BotCommand } from '../../lib/extensions/BotCommand';
import { Message, MessageEmbed } from 'discord.js';
import { stripIndent } from 'common-tags';

export default class GuildInfoCommand extends BotCommand {
	public constructor() {
		super('guildinfo', {
			aliases: ['guildinfo', 'serverinfo'],
			category: 'info',
			ratelimit: 4,
			cooldown: 4000,
			description: {
				content: 'Use to get info about the server the command was run in',
				usage: 'severinfo',
				examples: ['serverinfo']
			},
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS']
			//hidden: true
		});
	}
	public exec(message: Message): void {
		const GuildInfoEmbed = new MessageEmbed().setAuthor(message.guild.name, message.guild.iconURL()).setColor(this.client.consts.DefaultColor).setDescription(stripIndent`**» About**
**Owner:** ${message.guild.owner}
**Members:** ${message.guild.memberCount}
**Channels:** ${message.guild.channels.cache.size}
**Region:** ${message.guild.region}
`);
		message.channel.send('wip');
		message.channel.send(GuildInfoEmbed);
	}
}
