import chalk from 'chalk';
import { Message, DMChannel } from 'discord.js';
import { BotCommand } from '../../lib/extensions/BotCommand';
import { BotListener } from '../../lib/extensions/BotListener';

export default class CommandStartedListener extends BotListener {
	constructor() {
		super('logCommands', {
			emitter: 'commandHandler',
			event: 'commandStarted'
		});
	}
	exec(message: Message, command: BotCommand): void {
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
