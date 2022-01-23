import { BushListener, type BushCommandHandlerEvents } from '#lib';
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
		return void client.logger.info(
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
	}
}
