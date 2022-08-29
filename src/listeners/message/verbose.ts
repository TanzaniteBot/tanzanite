import { BotListener, type BotClientEvents } from '#lib';
import { ChannelType } from 'discord.js';

export default class MessageVerboseListener extends BotListener {
	public constructor() {
		super('messageVerbose', {
			emitter: 'client',
			event: 'messageCreate'
		});
	}

	public exec(...[message]: BotClientEvents['messageCreate']): void {
		if (this.client.customReady) {
			if (message.channel?.type === ChannelType.DM) return;
			void this.client.console.verbose(
				'messageVerbose',
				`A message was sent by <<${message.author.tag}>> in <<${message.channel.name}>> in <<${message.guild!.name}>>.`
			);
		}
	}
}
