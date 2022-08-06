import { BlockedReasons, BushListener, emojis, format } from '#lib';
import { type ContextMenuCommandHandlerEvents } from 'discord-akairo';

export default class ContextCommandBlockedListener extends BushListener {
	public constructor() {
		super('contextCommandBlocked', {
			emitter: 'contextMenuCommandHandler',
			event: 'blocked',
			category: 'contextCommands'
		});
	}

	public async exec(...[interaction, command, reason]: ContextMenuCommandHandlerEvents['blocked']) {
		void this.client.console.info(
			`ContextCommandBlocked`,
			`<<${interaction.user.tag}>> tried to run <<${command}>> but was blocked because <<${reason}>>.`,
			true
		);

		switch (reason) {
			case BlockedReasons.OWNER: {
				return await interaction.reply({
					content: `${emojis.error} Only my developers can run the ${format.input(command!.id)} command.`,
					ephemeral: true
				});
			}
			case BlockedReasons.SUPER_USER: {
				return await interaction.reply({
					content: `${emojis.error} You must be a superuser to run the ${format.input(command!.id)} command.`,
					ephemeral: true
				});
			}
			default: {
				return await interaction.reply({
					content: `${emojis.error} Command blocked with reason ${format.input(reason ?? 'unknown')}.`,
					ephemeral: true
				});
			}
		}
	}
}
