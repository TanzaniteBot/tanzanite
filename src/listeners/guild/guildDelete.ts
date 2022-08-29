import { BotListener, colors, emojis, format, type BotClientEvents } from '#lib';

export default class GuildDeleteListener extends BotListener {
	public constructor() {
		super('guildDelete', {
			emitter: 'client',
			event: 'guildDelete' // when the bot leaves a guild
		});
	}

	public async exec(...[guild]: BotClientEvents['guildDelete']) {
		void this.client.console.info(
			'guildDelete',
			`Left <<${guild.name}>> with <<${guild.memberCount?.toLocaleString()}>> members.`
		);

		const channel = await this.client.utils.getConfigChannel('servers');
		if (!channel) return;
		return await channel.send({
			embeds: [
				{
					color: colors.Red,
					description: `${emojis.leave} Left ${format.input(
						guild.name
					)} with **${guild.memberCount?.toLocaleString()}** members. I am now in **${this.client.guilds.cache.size}** guilds.`,
					timestamp: new Date().toISOString(),
					footer: { text: `${guild.id}`, icon_url: guild.iconURL() ?? undefined }
				}
			]
		});
	}
}
