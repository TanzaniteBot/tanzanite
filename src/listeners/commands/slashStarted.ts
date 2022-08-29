import { BotListener, type BotCommandHandlerEvents } from '#lib';
import { ChannelType } from 'discord.js';

export default class SlashStartedListener extends BotListener {
	public constructor() {
		super('slashStarted', {
			emitter: 'commandHandler',
			event: 'slashStarted'
		});
	}

	public async exec(...[message, command]: BotCommandHandlerEvents['slashStarted']) {
		this.client.sentry.addBreadcrumb({
			message: `[slashStarted] The ${command.id} was started by ${message.author.tag}.`,
			level: 'info',
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
