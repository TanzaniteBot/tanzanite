import { BotListener, Emitter, Guild, colors, emojis, format, type BotClientEvents } from '#lib';
import { Events } from 'discord.js';

export default class GuildCreateListener extends BotListener {
	public constructor() {
		super('guildCreate', {
			emitter: Emitter.Client,
			event: Events.GuildCreate // when the bot joins a guild
		});
	}

	public async exec(...[guild]: BotClientEvents[Events.GuildCreate]) {
		void this.client.console.info(
			'guildCreate',
			`Joined <<${guild.name}>> with <<${guild.memberCount?.toLocaleString()}>> members.`
		);
		const g = await Guild.findByPk(guild.id);
		if (!g) void Guild.create({ id: guild.id });

		const channel = await this.client.utils.getConfigChannel('servers');
		if (!channel) return;
		return await channel.send({
			embeds: [
				{
					color: colors.Green,
					description: `${emojis.join} Joined ${format.input(
						guild.name
					)} with **${guild.memberCount?.toLocaleString()}** members. I am now in **${this.client.guilds.cache.size}** guilds.`,
					timestamp: new Date().toISOString(),
					footer: { text: `${guild.id}`, icon_url: guild.iconURL() ?? undefined }
				}
			]
		});
	}
}
