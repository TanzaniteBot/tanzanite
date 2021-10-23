import { BushCommand, BushMessage, BushSlashMessage, ButtonPaginator } from '@lib';
import { Guild, MessageEmbedOptions } from 'discord.js';

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
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: [],
			ownerOnly: true
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage): Promise<unknown> {
		const guilds = [...client.guilds.cache.sort((a, b) => (a.memberCount < b.memberCount ? 1 : -1)).values()];
		const chunkedGuilds: Guild[][] = util.chunk(guilds, 10);
		const embeds: MessageEmbedOptions[] = chunkedGuilds.map((chunk) => {
			return {
				title: `Server List [\`${guilds.length.toLocaleString()}\`]`,
				color: util.colors.default,
				fields: chunk.map((guild) => ({
					name: util.format.bold(guild.name),
					value: [
						`**ID:** ${guild.id}`,
						`**Owner:** ${client.users.cache.has(guild.ownerId) ? client.users.cache.get(guild.ownerId)!.tag : guild.ownerId}`,
						`**Members:** ${guild.memberCount.toLocaleString()}`
					].join('\n')
				}))
			} as MessageEmbedOptions;
		});

		return await ButtonPaginator.send(message, embeds);
	}
}
