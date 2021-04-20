import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message, MessageEmbed } from 'discord.js';
import { stripIndent } from 'common-tags';

export default class GuildInfoCommand extends BushCommand {
	public constructor() {
		super('guildinfo', {
			aliases: ['guildinfo', 'serverinfo', 'guild', 'server'],
			category: 'info',
			ratelimit: 4,
			cooldown: 4000,
			description: {
				content: 'Use to get info about the server the command was run in',
				usage: 'severinfo',
				examples: ['serverinfo']
			},
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES']
			//hidden: true
		});
	}
	public exec(message: Message): unknown {
		const guild = message.guild
		const GuildInfoEmbed = new MessageEmbed()
			.setAuthor(guild.name, guild.iconURL())
			.setColor(this.client.consts.DefaultColor)
			.addField(
				'» About',
				stripIndent`**Owner:** ${guild.members.cache.get(guild.ownerID).user.tag}
**Members:** ${guild.memberCount}
**Channels:** ${guild.channels.cache.size}
**Region:** ${guild.region}
**Boosts:** Level ${guild.premiumTier} with ${guild.premiumSubscriptionCount} boosts`);
		const features= [];
		message.guild.features.forEach(feature => {
			const formatted = feature
				.toLowerCase()
				.replace(/_/g, ' ')
				.replace(/(\b\w)/gi, (lc): string => lc.toUpperCase())
				.replace(/'(S)/g, (letter): string => letter.toLowerCase());
			return features.push(formatted);
		});
		if (message.guild.features.length > 0) {
			GuildInfoEmbed.addField('» Features', features.join(', '));
		}
		return message.channel.send(GuildInfoEmbed);
	}
}
