import { BushListener } from '#lib';
import { ContextMenuCommandHandlerEvents } from 'discord-akairo';
import { ApplicationCommandType, ChannelType } from 'discord.js';

export default class ContextCommandStartedListener extends BushListener {
	public constructor() {
		super('contextCommandStarted', {
			emitter: 'contextMenuCommandHandler',
			event: 'started',
			category: 'contextCommands'
		});
	}

	public async exec(...[interaction, command]: ContextMenuCommandHandlerEvents['started']) {
		client.sentry.addBreadcrumb({
			message: `[contextCommandStarted] The ${command.id} was started by ${interaction.user.tag}.`,
			level: 'info',
			timestamp: Date.now(),
			data: {
				'command.name': command?.id,
				'interaction.id': interaction.id,
				'interaction.commandType': ApplicationCommandType[interaction.commandType] ?? interaction.commandType,
				'interaction.targetId': interaction.targetId,
				'channel.id':
					(interaction.channel?.isDMBased() ? interaction.channel.recipient?.id : interaction.channel?.id) ?? '¯\\_(ツ)_/¯',
				'channel.name':
					(interaction.channel?.isDMBased() ? interaction.channel.recipient?.tag : (<any>interaction.channel)?.name) ??
					'¯\\_(ツ)_/¯',
				'guild.id': interaction.guild?.id ?? '¯\\_(ツ)_/¯',
				'guild.name': interaction.guild?.name ?? '¯\\_(ツ)_/¯',
				'environment': client.config.environment
			}
		});

		return void client.logger.info(
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
