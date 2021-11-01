import { BushListener, type BushClientEvents } from '@lib';

export default class MessageVerboseListener extends BushListener {
	public constructor() {
		super('messageVerbose', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public override exec(...[message]: BushClientEvents['messageCreate']): void {
		if (client.customReady) {
			if (message.channel?.type === 'DM') return;
			void client.console.verbose(
				'messageVerbose',
				`A message was sent by <<${message.author.tag}>> in <<${message.channel.name}>> in <<${message.guild!.name}>>.`
			);
		}
	}
}
