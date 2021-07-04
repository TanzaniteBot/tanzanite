import { BushCommand, BushListener, BushSlashMessage } from '../../lib';

export default class SlashStartedListener extends BushListener {
	public constructor() {
		super('slashStarted', {
			emitter: 'commandHandler',
			event: 'slashStarted'
		});
	}
	exec(message: BushSlashMessage, command: BushCommand): void {
		this.client.logger.info(
			'SlashCommand',
			`The <<${command.id}>> command was used by <<${message.author.tag}>> in ${
				!message.channel ? `their <<DMs>>` : `<<#${message.channel.name}>> in <<${message.guild?.name}>>`
			}.`,
			true //// I don't want to spam the log channel when people use commands
		);
	}
}
