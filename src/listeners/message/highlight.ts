import { BushListener, type BushClientEvents } from '#lib';

export default class HighlightListener extends BushListener {
	public constructor() {
		super('highlight', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public override async exec(...[message]: BushClientEvents['messageCreate']) {
		if (!message.inGuild()) return;
		if (message.author.bot) return;
		if (!(await message.guild.hasFeature('highlight'))) return; // allows highlighting to be disabled on a guild-by-guild basis

		const res = client.highlightManager.checkMessage(message);

		for (const [user, hl] of res.entries()) {
			if (message.author.id === user) continue;
			void client.highlightManager.notify(message, user, hl);
		}
	}
}
