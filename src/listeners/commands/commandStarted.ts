import chalk from 'chalk';
import { Message, DMChannel } from 'discord.js';
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
		this.client.logger.verbose(
			chalk`{cyan {green ${message.author.tag}} is running {green ${
				command.aliases[0]
			}} in {green ${
				message.channel instanceof DMChannel
					? 'DMs'
					: `#${message.channel.name} (Server: ${message.guild.name})`
			}}.}`
		);
	}
}
