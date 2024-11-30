import { BotListener, ContextCommandHandlerEvent, Emitter } from '#lib';
import { channelBreadCrumbData, guildBreadCrumbData } from '#lib/common/Sentry.js';
import type { ContextMenuCommandHandlerEvents } from '@tanzanite/discord-akairo';
import { ApplicationCommandType, ChannelType } from 'discord.js';

export default class ContextCommandStartedListener extends BotListener {
	public constructor() {
		super('contextCommandStarted', {
			emitter: Emitter.ContextMenuCommandHandler,
			event: ContextCommandHandlerEvent.Started
		});
	}

	public async exec(...[interaction, command]: ContextMenuCommandHandlerEvents[ContextCommandHandlerEvent.Started]) {
		this.client.sentry.addBreadcrumb({
			message: `[contextCommandStarted] The ${command.id} was started by ${interaction.user.tag}.`,
			level: 'info',
			timestamp: Date.now(),
			data: {
				'command.name': command?.id,
				'interaction.id': interaction.id,
				'interaction.commandType': ApplicationCommandType[interaction.commandType] ?? interaction.commandType,
				'interaction.targetId': interaction.targetId,
				...channelBreadCrumbData(interaction.channel),
				...guildBreadCrumbData(interaction.guild),
				'environment': this.client.config.environment
			}
		});

		return void this.client.logger.info(
			'contextCommandStarted',
			`The <<${command.id}>> command was used by <<${interaction.user.tag}>> in ${
				interaction.channel
					? interaction.channel.type === ChannelType.DM
						? `their <<DMs>>`
						: `<<#${interaction.channel.name}>> in <<${interaction.guild?.name}>>`
					: 'unknown'
			}.`,
			true
		);
	}
}
