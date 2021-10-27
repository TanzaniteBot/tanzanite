import { BushCommandHandlerEvents, BushListener } from '@lib';

export default class SlashStartedListener extends BushListener {
	public constructor() {
		super('slashStarted', {
			emitter: 'commandHandler',
			event: 'slashStarted',
			category: 'commands'
		});
	}
	public override async exec(...[message, command]: BushCommandHandlerEvents['slashStarted']) {
		return void client.logger.info(
			'slashStarted',
			`The <<${command.id}>> command was used by <<${message.author.tag}>> in ${
				message.channel
					? message.channel.type === 'DM'
						? `their <<DMs>>`
						: `<<#${message.channel.name}>> in <<${message.guild?.name}>>`
					: 'unknown'
			}.`,
			true
		);
	}
}
