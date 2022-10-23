import { BotListener, Emitter, type BotClientEvents } from '#lib';
import { ChannelType, Events } from 'discord.js';

export default class autoPublisherListener extends BotListener {
	public constructor() {
		super('autoPublisher', {
			emitter: Emitter.Client,
			event: Events.MessageCreate
		});
	}

	public async exec(...[message]: BotClientEvents[Events.MessageCreate]) {
		if (!message.guild || !(await message.guild.hasFeature('autoPublish'))) return;

		const autoPublishChannels = await message.guild.getSetting('autoPublishChannels');
		if (!autoPublishChannels || message.channel.type !== ChannelType.GuildAnnouncement) return;

		if (!autoPublishChannels.some((x) => message.channel.id.includes(x))) return;

		const onlyEmbeds = [/* #neu-neu-github */ '913500894463688734', /* #item-repo-github */ '782464759165354004'];

		if (onlyEmbeds.includes(message.channel.id) && message.embeds.length === 0) return;

		await message
			.crosspost()
			.then(
				() => void this.client.logger.log('autoPublisher', `Published message <<${message.id}>> in <<${message.guild!.name}>>.`)
			)
			.catch(() => {
				void this.client.console.log('autoPublisher', `Failed to publish <<${message.id}>> in <<${message.guild!.name}>>.`);
				void message.guild?.error('autoPublisher', `Unable to publish message id ${message.id} in <#${message.channel.id}>.`);
			});
	}
}
