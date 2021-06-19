import { Message } from 'discord.js';
import { BushCommand } from '../../lib/extensions/BushCommand';
import { BushListener } from '../../lib/extensions/BushListener';

export default class CommandStartedListener extends BushListener {
	constructor() {
		super('logCommands', {
			emitter: 'commandHandler',
			event: 'commandStarted'
		});
	}
	exec(message: Message, command: BushCommand): void {
		this.client.logger.info(
			'Command',
			`The <<${command.id}>> command was used by <<${message.author.tag}>> in ${
				message.channel.type === 'dm' ? `their <<DMs>>` : `<<#${message.channel.name}>> in <<${message.guild?.name}>>`
			}.`,
			false // I don't want to spam the log channel when people use commands
		);
	}
}
