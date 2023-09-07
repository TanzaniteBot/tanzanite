import { BotListener, ContextCommandHandlerEvent, Emitter, emojis, format } from '#lib';
import type { ContextMenuCommandHandlerEvents } from '@tanzanite/discord-akairo';
import { BuiltInReasons } from '@tanzanite/discord-akairo/dist/src/util/Constants.js';

export default class ContextCommandBlockedListener extends BotListener {
	public constructor() {
		super('contextCommandBlocked', {
			emitter: Emitter.ContextMenuCommandHandler,
			event: ContextCommandHandlerEvent.Blocked
		});
	}

	public async exec(...[interaction, command, reason]: ContextMenuCommandHandlerEvents[ContextCommandHandlerEvent.Blocked]) {
		void this.client.console.info(
			`ContextCommandBlocked`,
			`<<${interaction.user.tag}>> tried to run <<${command}>> but was blocked because <<${reason}>>.`,
			true
		);

		switch (reason) {
			case BuiltInReasons.OWNER: {
				return await interaction.reply({
					content: `${emojis.error} Only my developers can run the ${format.input(command!.id)} command.`,
					ephemeral: true
				});
			}
			case BuiltInReasons.SUPER_USER: {
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
