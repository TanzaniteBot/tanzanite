import { BushCommand, ButtonPaginator, type CommandMessage, type SlashMessage } from '#lib';
import { stripIndent } from '#tags';
import { type APIEmbed, type Guild } from 'discord.js';

export default class ServersCommand extends BushCommand {
	public constructor() {
		super('servers', {
			aliases: ['servers', 'guilds'],
			category: 'dev',
			description: 'Displays all the severs the bot is in',
			usage: ['servers'],
			examples: ['servers'],
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: [],
			ownerOnly: true
		});
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		const guilds = [...client.guilds.cache.sort((a, b) => (a.memberCount < b.memberCount ? 1 : -1)).values()];
		const chunkedGuilds: Guild[][] = util.chunk(guilds, 10);
		const embeds: APIEmbed[] = chunkedGuilds.map((chunk) => {
			return {
				title: `Server List [\`${guilds.length.toLocaleString()}\`]`,
				color: util.colors.default,
				fields: chunk.map((guild) => ({
					name: util.format.input(guild.name),
					value: stripIndent`
						**ID:** ${guild.id}
						**Owner:** ${client.users.cache.has(guild.ownerId) ? client.users.cache.get(guild.ownerId)!.tag : guild.ownerId}
						**Members:** ${guild.memberCount.toLocaleString()}`
				}))
			} as APIEmbed;
		});

		return await ButtonPaginator.send(message, embeds);
	}
}
