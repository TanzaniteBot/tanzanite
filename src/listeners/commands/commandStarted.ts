import { BushListener, type BushCommandHandlerEvents } from '#lib';
import { ChannelType } from 'discord.js';

export default class CommandStartedListener extends BushListener {
	public constructor() {
		super('commandStarted', {
			emitter: 'commandHandler',
			event: 'commandStarted',
			category: 'commands'
		});
	}

	public exec(...[message, command]: BushCommandHandlerEvents['commandStarted']): void {
		this.client.sentry.addBreadcrumb({
			message: `[commandStarted] The ${command.id} was started by ${message.author.tag}.`,
			level: 'info',
			timestamp: Date.now(),
			data: {
				'command.name': command?.id,
				'message.id': message.id,
				'message.type': message.util.isSlash ? 'slash' : 'normal',
				'message.parsed.content': message.util.parsed?.content,
				'channel.id': (message.channel.isDMBased() ? message.channel.recipient?.id : message.channel?.id) ?? '¯\\_(ツ)_/¯',
				'channel.name':
					(message.channel.isDMBased() ? message.channel.recipient?.tag : (<any>message.channel)?.name) ?? '¯\\_(ツ)_/¯',
				'guild.id': message.guild?.id ?? '¯\\_(ツ)_/¯',
				'guild.name': message.guild?.name ?? '¯\\_(ツ)_/¯',
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
