import { BotListener, Emitter, type BotClientEvents } from '#lib';
import { ChannelType, Events } from 'discord.js';

export default class MessageVerboseListener extends BotListener {
	public constructor() {
		super('messageVerbose', {
			emitter: Emitter.Client,
			event: Events.MessageCreate
		});
	}

	public exec(...[message]: BotClientEvents[Events.MessageCreate]): void {
		if (this.client.customReady) {
			if (message.channel?.type === ChannelType.DM) return;
			void this.client.console.verbose(
				'messageVerbose',
				`A message was sent by <<${message.author.tag}>> in <<${message.channel.name}>> in <<${message.guild!.name}>>.`
			);
		}
	}
}
