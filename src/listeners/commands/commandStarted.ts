import { BushCommand, BushListener } from '@lib';
import { Message } from 'discord.js';

export default class CommandStartedListener extends BushListener {
	public constructor() {
		super('commandStarted', {
			emitter: 'commandHandler',
			event: 'commandStarted'
		});
	}
	exec(message: Message, command: BushCommand): void {
		this.client.logger.info(
			'Command',
			`The <<${command.id}>> command was used by <<${message.author.tag}>> in ${
				message.channel.type === 'DM' ? `their <<DMs>>` : `<<#${message.channel.name}>> in <<${message.guild?.name}>>`
			}.`,
			true //// I don't want to spam the log channel when people use commands
		);
	}
}
