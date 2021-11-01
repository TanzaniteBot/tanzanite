import { BushListener, type BushCommandHandlerEvents } from '@lib';
import { Severity } from '@sentry/types';
import { type GuildTextBasedChannels } from 'discord-akairo';
import { type DMChannel } from 'discord.js';

export default class CommandStartedListener extends BushListener {
	public constructor() {
		super('commandStarted', {
			emitter: 'commandHandler',
			event: 'commandStarted',
			category: 'commands'
		});
	}
	public override exec(...[message, command]: BushCommandHandlerEvents['commandStarted']): void {
		client.sentry.addBreadcrumb({
			message: `[commandStarted] The ${command.id} was started by ${message.author.tag}.`,
			level: Severity.Info,
			timestamp: Date.now(),
			data: {
				'command.name': command?.id,
				'message.id': message.id,
				'message.type': message.util.isSlash ? 'slash' : 'normal',
				'message.parsed.content': message.util.parsed!.content,
				'channel.id':
					message.channel!.type === 'DM'
						? (message.channel as DMChannel)!.recipient.id
						: (message.channel as GuildTextBasedChannels)!.id,
				'channel.name':
					message.channel!.type === 'DM'
						? (message.channel as DMChannel)!.recipient.tag
						: (message.channel as GuildTextBasedChannels)!.name,
				'guild.id': message.guild?.id,
				'guild.name': message.guild?.name,
				'environment': client.config.environment
			}
		});

		void client.logger.info(
			'commandStarted',
			`The <<${command.id}>> command was used by <<${message.author.tag}>> in ${
				message.channel.type === 'DM' ? `their <<DMs>>` : `<<#${message.channel.name}>> in <<${message.guild?.name}>>`
			}.`,
			true
		);

		client.stats.commandsUsed = client.stats.commandsUsed + 1n;
	}
}
