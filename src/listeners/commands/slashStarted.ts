import { BushCommand } from '../../lib/extensions/discord-akairo/BushCommand';
import { BushListener } from '../../lib/extensions/discord-akairo/BushListener';
import { BushSlashMessage } from '../../lib/extensions/discord-akairo/BushSlashMessage';

export default class SlashStartedListener extends BushListener {
	constructor() {
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
