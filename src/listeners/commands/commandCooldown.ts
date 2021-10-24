import { BushCommandHandlerEvents, BushListener } from '@lib';

export default class CommandCooldownListener extends BushListener {
	public constructor() {
		super('commandCooldown', {
			emitter: 'commandHandler',
			event: 'cooldown',
			category: 'commands'
		});
	}

	public override async exec(...[message, command, remaining]: BushCommandHandlerEvents['cooldown']): Promise<void> {
		void client.console.info(
			'commandCooldown',
			`<<${message.author.tag}>> tried to run <<${
				command ?? message.util!.parsed?.command
			}>> but it is on cooldown for <<${Math.round(remaining / 1000)}>> seconds.`
		);
		message.util!.isSlashMessage(message)
			? message.util?.reply({
					content: `⏳ This command is on cooldown for ${Math.round(remaining / 1000)} seconds.`,
					ephemeral: true
			  })
			: await message.react('⏳').catch(() => null);
	}
}
