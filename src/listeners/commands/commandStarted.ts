import { BushCommandHandlerEvents, BushListener } from '@lib';

export default class CommandStartedListener extends BushListener {
	public constructor() {
		super('commandStarted', {
			emitter: 'commandHandler',
			event: 'commandStarted',
			category: 'commands'
		});
	}
	exec(...[message, command]: BushCommandHandlerEvents['commandStarted']): void {
		client.logger.info(
			'Command',
			`The <<${command.id}>> command was used by <<${message.author.tag}>> in ${
				message.channel.type === 'DM' ? `their <<DMs>>` : `<<#${message.channel.name}>> in <<${message.guild?.name}>>`
			}.`,
			true
		);
	}
}
