import { BushListener } from '#lib';
import { ContextMenuCommandHandlerEvents } from 'discord-akairo';
import { ChannelType } from 'discord.js';

export default class ContextCommandStartedListener extends BushListener {
	public constructor() {
		super('contextCommandStarted', {
			emitter: 'contextMenuCommandHandler',
			event: 'started',
			category: 'contextCommands'
		});
	}

	public override async exec(...[interaction, command]: ContextMenuCommandHandlerEvents['started']) {
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
