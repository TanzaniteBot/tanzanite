import { BushListener } from '../../lib';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class MessageVerboseListener extends BushListener {
	public constructor() {
		super('messageVerbose', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public override exec(...[message]: BushClientEvents['messageCreate']): Promise<void> | undefined {
		if (message.channel?.type === 'DM') return;
		void this.client.console.verbose(
			'Message',
			`A message was sent by <<${message.author.tag}>> in <<${message.channel.name}>> in <<${message.guild!.name}>>.`
		);
	}
}
