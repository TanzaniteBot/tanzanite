import { BotListener, CommandHandlerEvent, Emitter, type BotCommandHandlerEvents } from '#lib';
import { interactionBreadCrumbs, messageBreadCrumbs } from '#lib/common/Sentry.js';
import { InteractionContextType } from 'discord.js';
import assert from 'node:assert';

export default class SlashStartedListener extends BotListener {
	public constructor() {
		super('slashStarted', {
			emitter: Emitter.CommandHandler,
			event: CommandHandlerEvent.SlashStarted
		});
	}

	public exec(...[message, command]: BotCommandHandlerEvents[CommandHandlerEvent.SlashStarted]) {
		const { interaction } = message;

		assert(interaction != null);

		let breadcrumbs: Record<string, unknown> = {};
		let location: string = '<<unknown>>';

		switch (interaction.context) {
			case InteractionContextType.Guild: {
				assert(interaction.inGuild());

				breadcrumbs = messageBreadCrumbs(message);
				if (interaction.channel === null) {
					location = 'unknown'; // discord.js doesn't propagate channel name properly when installed as user app
				} else {
					location = `<<#${interaction.channel.name}>> in <<${interaction.guild?.name}>>`;
				}

				break;
			}
			case InteractionContextType.BotDM: {
				breadcrumbs = interactionBreadCrumbs(interaction);
				location = 'our <<DMs>>';

				break;
			}
			case InteractionContextType.PrivateChannel: {
				breadcrumbs = interactionBreadCrumbs(interaction);
				location = 'other <<DMs>>';

				break;
			}
			case null:
			default: {
				console.error('Unknown interaction context:', interaction.context);
				break;
			}
		}

		this.client.sentry.addBreadcrumb({
			message: `[slashStarted] The ${command.id} was started by ${interaction.user.tag}.`,
			level: 'info',
			timestamp: Date.now(),
			data: {
				'command.name': command?.id,
				...breadcrumbs,
				'environment': this.client.config.environment
			}
		});

		void this.client.logger.info(
			'slashStarted',
			`The <<${command.id}>> command was used by <<${interaction.user.tag}>> in ${location}.`,
			true
		);

		this.client.stats.commandsUsed = this.client.stats.commandsUsed + 1n;
		this.client.stats.slashCommandsUsed = this.client.stats.slashCommandsUsed + 1n;
	}
}
