import { BotListener, colors, Emitter, emojis, format, type BotClientEvents } from '#lib';
import { Events } from 'discord.js';

export default class GuildDeleteListener extends BotListener {
	public constructor() {
		super('guildDelete', {
			emitter: Emitter.Client,
			event: Events.GuildDelete // when the bot leaves a guild
		});
	}

	public async exec(...[guild]: BotClientEvents[Events.GuildDelete]) {
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
