import { Message } from 'discord.js';
import { BushCommand } from '../../lib/extensions/BushCommand';
import { BushListener } from '../../lib/extensions/BushListener';

export default class SlashStartedListener extends BushListener {
	constructor() {
		super('slashStarted', {
			emitter: 'commandHandler',
			event: 'slashStarted'
		});
	}
	exec(message: Message, command: BushCommand): void {
		this.client.logger.info(
			'SlashCommand',
			`The <<${command.id}>> command was used by <<${message.author.tag}>> in ${
				message.channel.type === 'dm' ? `their <<DMs>>` : `<<#${message.channel.name}>> in <<${message.guild?.name}>>`
			}.`,
			false // I don't want to spam the log channel when people use commands
		);
	}
}
