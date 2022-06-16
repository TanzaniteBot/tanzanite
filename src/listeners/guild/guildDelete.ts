import { BushListener, colors, emojis, format, getConfigChannel, type BushClientEvents } from '#lib';

export default class GuildDeleteListener extends BushListener {
	public constructor() {
		super('guildDelete', {
			emitter: 'client',
			event: 'guildDelete', // when the bot leaves a guild
			category: 'guild'
		});
	}

	public async exec(...[guild]: BushClientEvents['guildDelete']) {
		void client.console.info('guildDelete', `Left <<${guild.name}>> with <<${guild.memberCount?.toLocaleString()}>> members.`);

		const channel = await getConfigChannel('servers');
		if (!channel) return;
		return await channel.send({
			embeds: [
				{
					color: colors.Red,
					description: `${emojis.leave} Left ${format.input(
						guild.name
					)} with **${guild.memberCount?.toLocaleString()}** members. I am now in **${client.guilds.cache.size}** guilds.`,
					timestamp: new Date().toISOString(),
					footer: { text: `${guild.id}`, icon_url: guild.iconURL() ?? undefined }
				}
			]
		});
	}
}
