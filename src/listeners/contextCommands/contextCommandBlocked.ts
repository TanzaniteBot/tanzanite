import { BushListener } from '#lib';
import { type ContextMenuCommandHandlerEvents } from 'discord-akairo';

export default class ContextCommandBlockedListener extends BushListener {
	public constructor() {
		super('contextCommandBlocked', {
			emitter: 'contextMenuCommandHandler',
			event: 'blocked',
			category: 'contextCommands'
		});
	}

	public override async exec(...[interaction, command, reason]: ContextMenuCommandHandlerEvents['blocked']) {
		void client.console.info(
			`ContextCommandBlocked`,
			`<<${interaction.user.tag}>> tried to run <<${command}>> but was blocked because <<${reason}>>.`,
			true
		);

		switch (reason) {
			case client.consts.BlockedReasons.OWNER: {
				return await interaction.reply({
					content: `${util.emojis.error} Only my developers can run the ${util.format.input(command!.id)} command.`,
					ephemeral: true
				});
			}
			case client.consts.BlockedReasons.SUPER_USER: {
				return await interaction.reply({
					content: `${util.emojis.error} You must be a superuser to run the ${util.format.input(command!.id)} command.`,
					ephemeral: true
				});
			}
			default: {
				return await interaction.reply({
					content: `${util.emojis.error} Command blocked with reason ${util.format.input(reason ?? 'unknown')}.`,
					ephemeral: true
				});
			}
		}
	}
}
