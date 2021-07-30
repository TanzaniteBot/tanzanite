import { BushListener } from '../../lib';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class autoPublisherListener extends BushListener {
	public constructor() {
		super('autoPublisher', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public async exec(...[message]: BushClientEvents['messageCreate']): Promise<void> {
		if (!message.guild) return;
		const autoPublishChannels = await message.guild.getSetting('autoPublishChannels');
		if (autoPublishChannels) {
			if (message.channel.type === 'GUILD_NEWS' && autoPublishChannels.some((x) => message.channel.id.includes(x))) {
				const success = await message.crosspost().catch(() => false);
				if (!success)
					void client.console.warn('AutoPublisher', `Failed to publish <<${message.id}>> in <<${message.guild.name}>>.`);
				void client.logger.log('AutoPublisher', `Published message <<${message.id}>> in <<${message.guild.name}>>.`);
			}
		}
	}
}
