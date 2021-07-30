import { Guild, MessageEmbed } from 'discord.js';
import { BushCommand, BushMessage, BushSlashMessage } from '../../lib';

export default class ServersCommand extends BushCommand {
	public constructor() {
		super('servers', {
			aliases: ['servers', 'guilds'],
			category: 'dev',
			description: {
				content: 'Displays all the severs the bot is in',
				usage: 'servers',
				examples: ['servers']
			},
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES'],
			superUserOnly: true
		});
	}

	public async exec(message: BushMessage | BushSlashMessage): Promise<unknown> {
		const maxLength = 10;
		const guilds = client.guilds.cache.sort((a, b) => (a.memberCount < b.memberCount ? 1 : -1)).array();
		const chunkedGuilds: Guild[][] = [];
		const embeds: MessageEmbed[] = [];

		for (let i = 0, j = guilds.length; i < j; i += maxLength) {
			chunkedGuilds.push(guilds.slice(i, i + maxLength));
		}

		chunkedGuilds.forEach((c: Guild[]) => {
			const embed = new MessageEmbed();
			c.forEach((g: Guild) => {
				const owner = client.users.cache.get(g.ownerId)?.tag;
				embed
					.addField(
						`**${g.name}**`,
						`**ID:** ${g.id}\n**Owner:** ${owner ? owner : g.ownerId}\n**Members:** ${g.memberCount.toLocaleString()}`,
						false
					)
					.setTitle(`Server List [\`${client.guilds.cache.size.toLocaleString()}\`]`)
					.setColor(util.colors.default);
			});
			embeds.push(embed);
		});

		return await util.buttonPaginate(message, embeds);
	}
}
