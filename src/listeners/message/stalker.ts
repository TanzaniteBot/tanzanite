import { Message } from 'discord.js';
import { BushListener } from '../../lib/extensions/BushListener';
import * as botoptions from '../../config/botoptions';
import log from '../../constants/log';

export default class StalkerListener extends BushListener {
	public constructor() {
		super('StalkerListener', {
			emitter: 'client',
			event: 'message',
			category: 'message'
		});
	}

	public exec(message: Message): Promise<void> {
		if (message.channel?.type === 'dm') return;
		if (botoptions.verbose) {
			log.verbose('Message', `A message was sent by <<${message.author.tag}>> in <<${message.channel.name}>> in <<${message.guild.name}>>.`);
		}
	}
}
