import { BotListener, Emitter, mappings, type BotClientEvents } from '#lib';
import { Events, Routes } from 'discord.js';

export default class ExperimentYoink extends BotListener {
	public constructor() {
		super('experimentYoink', {
			emitter: Emitter.Client,
			event: Events.MessageCreate
		});
	}

	public async exec(...[message]: BotClientEvents[Events.MessageCreate]): Promise<any> {
		if (message.channelId !== '1019830755658055691') return;
		if (message.embeds.length < 1) return;
		if (!message.embeds[0].title?.includes('Guild Experiment')) return;

		const guild = this.client.guilds.cache.get(mappings.guilds["Moulberry's Bush"]);

		if (guild == null) return;

		return await this.client.rest.post(Routes.channelMessages('795356494261911553'), {
			body: {
				content: message.content,
				embeds: message.embeds.map((embed) => embed.toJSON())
			}
		});
	}
}
