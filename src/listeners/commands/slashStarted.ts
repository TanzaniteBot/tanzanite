import { BotListener, CommandHandlerEvent, Emitter, type BotCommandHandlerEvents } from '#lib';
import { messageBreadCrumbs } from '#lib/common/Sentry.js';
import { ChannelType } from 'discord.js';

export default class SlashStartedListener extends BotListener {
	public constructor() {
		super('slashStarted', {
			emitter: Emitter.CommandHandler,
			event: CommandHandlerEvent.SlashStarted
		});
	}

	public async exec(...[message, command]: BotCommandHandlerEvents[CommandHandlerEvent.SlashStarted]) {
		this.client.sentry.addBreadcrumb({
			message: `[slashStarted] The ${command.id} was started by ${message.author.tag}.`,
			level: 'info',
			timestamp: Date.now(),
			data: {
				'command.name': command?.id,
				...messageBreadCrumbs(message),
				'environment': this.client.config.environment
			}
		});

		void this.client.logger.info(
			'slashStarted',
			`The <<${command.id}>> command was used by <<${message.author.tag}>> in ${
				message.channel
					? message.channel.type === ChannelType.DM
						? `their <<DMs>>`
						: `<<#${message.channel.name}>> in <<${message.guild?.name}>>`
					: 'unknown'
			}.`,
			true
		);

		this.client.stats.commandsUsed = this.client.stats.commandsUsed + 1n;
		this.client.stats.slashCommandsUsed = this.client.stats.slashCommandsUsed + 1n;
	}
}
