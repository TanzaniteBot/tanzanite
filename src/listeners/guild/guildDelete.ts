import { BushListener, type BushClientEvents } from '#lib';

export default class GuildDeleteListener extends BushListener {
	public constructor() {
		super('guildDelete', {
			emitter: 'client',
			event: 'guildDelete', // when the bot leaves a guild
			category: 'guild'
		});
	}

	public override async exec(...[guild]: BushClientEvents['guildDelete']) {
		void client.console.info('guildDelete', `Left <<${guild.name}>> with <<${guild.memberCount?.toLocaleString()}>> members.`);

		const channel = await util.getConfigChannel('servers');
		if (!channel) return;
		return await channel.send({
			embeds: [
				{
					color: util.colors.Red,
					description: `${util.emojis.leave} Left ${util.format.input(
						guild.name
					)} with **${guild.memberCount?.toLocaleString()}** members. I am now in **${client.guilds.cache.size}** guilds.`,
					timestamp: new Date().toISOString(),
					footer: { text: `${guild.id}`, icon_url: guild.iconURL() ?? undefined }
				}
			]
		});
	}
}
