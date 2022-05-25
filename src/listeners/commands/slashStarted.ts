import { BushListener, type BushCommandHandlerEvents } from '#lib';
import { Severity } from '@sentry/types';
import { ChannelType } from 'discord.js';

export default class SlashStartedListener extends BushListener {
	public constructor() {
		super('slashStarted', {
			emitter: 'commandHandler',
			event: 'slashStarted',
			category: 'commands'
		});
	}

	public override async exec(...[message, command]: BushCommandHandlerEvents['slashStarted']) {
		client.sentry.addBreadcrumb({
			message: `[slashStarted] The ${command.id} was started by ${message.author.tag}.`,
			level: Severity.Info,
			timestamp: Date.now(),
			data: {
				'command.name': command?.id,
				'message.id': message.id,
				'message.type': message.util.isSlash ? 'slash' : 'normal',
				'message.parsed.content': message.util.parsed?.content,
				'channel.id': (message.channel?.isDMBased() ? message.channel.recipient?.id : message.channel?.id) ?? '¯\\_(ツ)_/¯',
				'channel.name':
					(message.channel?.isDMBased() ? message.channel.recipient?.tag : (<any>message.channel)?.name) ?? '¯\\_(ツ)_/¯',
				'guild.id': message.guild?.id ?? '¯\\_(ツ)_/¯',
				'guild.name': message.guild?.name ?? '¯\\_(ツ)_/¯',
				'environment': client.config.environment
			}
		});

		void client.logger.info(
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

		client.stats.commandsUsed = client.stats.commandsUsed + 1n;
	}
}
