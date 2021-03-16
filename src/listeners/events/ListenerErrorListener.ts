/*import { MessageEmbed, Message, TextChannel } from 'discord.js';
import { BotListener } from '../../extensions/BotListener';

export default class ListenerErrorListener extends BotListener {
	public constructor() {
		super('listenerError', {
			emitter: 'ListenerHandler',
			event: 'error',
			category: 'commands',
		});
	}

	public async exec(error: Error): Promise<void> {
		const errorChannel = <TextChannel>this.client.channels.cache.get(this.client.config.errorChannel);
		const errorEmbed: MessageEmbed = new MessageEmbed()
			.setTitle('An error occurred')
			.setDescription(`Error: ${await this.client.consts.haste(error.stack)}`)
			.setColor(this.client.consts.ErrorColor)
			.setTimestamp();
		await errorChannel.send(errorEmbed)
			.catch(() => {
				console.error('[ListenerError] Failed to send error message.')
			});
	}
}
*/
