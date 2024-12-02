import { BotListener, CommandHandlerEvent, Emitter, type BotCommandHandlerEvents } from '#lib';
import { messageBreadCrumbs } from '#lib/common/Sentry.js';
import { ChannelType } from 'discord.js';

export default class CommandStartedListener extends BotListener {
	public constructor() {
		super('commandStarted', {
			emitter: Emitter.CommandHandler,
			event: CommandHandlerEvent.CommandStarted
		});
	}

	public exec(...[message, command]: BotCommandHandlerEvents[CommandHandlerEvent.CommandStarted]): void {
		this.client.sentry.addBreadcrumb({
			message: `[commandStarted] The ${command.id} was started by ${message.author.tag}.`,
			level: 'info',
			timestamp: Date.now(),
			data: {
				'command.name': command?.id,
				...messageBreadCrumbs(message),
				'environment': this.client.config.environment
			}
		});

		void this.client.logger.info(
			'commandStarted',
			`The <<${command.id}>> command was used by <<${message.author.tag}>> in ${
				message.channel.type === ChannelType.DM ? `their <<DMs>>` : `<<#${message.channel.name}>> in <<${message.guild?.name}>>`
			}.`,
			true
		);

		this.client.stats.commandsUsed = this.client.stats.commandsUsed + 1n;
	}
}
