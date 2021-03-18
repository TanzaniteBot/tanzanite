/* import { MessageEmbed, TextChannel } from 'discord.js';
import log from '../../constants/log';
import { BotListener } from '../../lib/extensions/BotListener';

export default class ListenerErrorListener extends BotListener {
	public constructor() {
		super('listenerError', {
			emitter: 'ListenerHandler',
			event: 'error',
			category: 'commands'
		});
	}

	public async exec(error: Error): Promise<void> {
		const errorChannel = <TextChannel>this.client.channels.cache.get(this.client.config.errorChannel);
		const errorEmbed: MessageEmbed = new MessageEmbed()
			.setTitle('An error occurred')
			.setDescription(`Error: ${await this.client.consts.haste(error.stack)}`)
			.setColor(this.client.consts.ErrorColor)
			.setTimestamp();
		await errorChannel.send(errorEmbed).catch(() => {
			log.error('ListenerError', `Failed to send error message for\n${error}`);
		});
	}
}
*/ 