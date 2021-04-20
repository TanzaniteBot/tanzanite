import { BushListener } from '../../lib/extensions/BushListener';
import * as botoptions from '../../config/botoptions';
import { Command } from 'discord-akairo';
import log from '../../lib/utils/log';
import { Message } from 'discord.js';

export default class CommandStartedListener extends BushListener {
	public constructor() {
		super('commandStarted', {
			emitter: 'commandHandler',
			event: 'commandStarted',
			category: 'commands'
		});
	}

	public exec(message: Message, command: Command | null | undefined): void {
		if (botoptions.info) {
			log.info('Command', `The <<${command.id}>> command was used by <<${message.author.tag}>> in <<${message.guild?.name}>>`);
		}
	}
}
