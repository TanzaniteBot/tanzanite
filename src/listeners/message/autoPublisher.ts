import { BotListener, type BotClientEvents } from '#lib';
import { ChannelType } from 'discord.js';

export default class autoPublisherListener extends BotListener {
	public constructor() {
		super('autoPublisher', {
			emitter: 'client',
			event: 'messageCreate'
		});
	}

	public async exec(...[message]: BotClientEvents['messageCreate']) {
		if (!message.guild || !(await message.guild.hasFeature('autoPublish'))) return;
		const autoPublishChannels = await message.guild.getSetting('autoPublishChannels');
		if (autoPublishChannels) {
			if (message.channel.type === ChannelType.GuildNews && autoPublishChannels.some((x) => message.channel.id.includes(x))) {
				await message
					.crosspost()
					.then(
						() =>
							void this.client.logger.log('autoPublisher', `Published message <<${message.id}>> in <<${message.guild!.name}>>.`)
					)
					.catch(() => {
						void this.client.console.log('autoPublisher', `Failed to publish <<${message.id}>> in <<${message.guild!.name}>>.`);
						void message.guild?.error('autoPublisher', `Unable to publish message id ${message.id} in <#${message.channel.id}>.`);
					});
			}
		}
	}
}
