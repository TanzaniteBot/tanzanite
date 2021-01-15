import { BotListener } from '../../classes/BotListener';
import { Message, TextChannel } from 'discord.js';

export default class APListener extends BotListener {
	public constructor() {
		super('APListener', {
			emitter: 'client',
			event: 'message',
			category: 'message',
		});
	}

	public async exec(message: Message): Promise<void> {
		if (message.channel.type === 'news' && this.client.config.autoPublishChannels.some((x) => message.channel.id.includes(x))) {
			const generalLogChannel = <TextChannel>this.client.channels.cache.get(this.client.config.generalLogChannel);
			try {
				await generalLogChannel.send(
					`Found unpublished message (<${message.url}>) in channel ${message.channel.name}(${message.channel.id}) in ${message.guild.name}`
				);
				await message.crosspost();
				await generalLogChannel.send('Published message.');
			} catch (e) {
				await generalLogChannel.send(e);
			}
		}
	}
}
