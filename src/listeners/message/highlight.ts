import { BotListener, Emitter, type BotClientEvents } from '#lib';
import { Events } from 'discord.js';

export default class HighlightListener extends BotListener {
	public constructor() {
		super('highlight', {
			emitter: Emitter.Client,
			event: Events.MessageCreate
		});
	}

	public async exec(...[message]: BotClientEvents[Events.MessageCreate]) {
		if (!message.inGuild()) return;
		if (message.author.bot || message.system) return;
		if (!(await message.guild.hasFeature('highlight'))) return; // allows highlighting to be disabled on a guild-by-guild basis

		this.client.highlightManager.updateLastTalked(message);
		const res = this.client.highlightManager.checkMessage(message);

		for (const [user, hl] of res.entries()) {
			if (message.author.id === user) continue;
			void this.client.highlightManager.notify(message, user, hl);
		}
	}
}
