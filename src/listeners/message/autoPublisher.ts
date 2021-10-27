import { BushClientEvents, BushListener } from '@lib';

export default class autoPublisherListener extends BushListener {
	public constructor() {
		super('autoPublisher', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public override async exec(...[message]: BushClientEvents['messageCreate']) {
		if (!message.guild || !(await message.guild.hasFeature('autoPublish'))) return;
		const autoPublishChannels = await message.guild.getSetting('autoPublishChannels');
		if (autoPublishChannels) {
			if (message.channel.type === 'GUILD_NEWS' && autoPublishChannels.some((x) => message.channel.id.includes(x))) {
				await message
					.crosspost()
					.then(
						() => void client.logger.log('autoPublisher', `Published message <<${message.id}>> in <<${message.guild!.name}>>.`)
					)
					.catch(
						() => void client.console.warn('autoPublisher', `Failed to publish <<${message.id}>> in <<${message.guild!.name}>>.`)
					);
			}
		}
	}
}
