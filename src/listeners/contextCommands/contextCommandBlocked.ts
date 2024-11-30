import { BotListener, ContextCommandHandlerEvent, Emitter, emojis, format } from '#lib';
import type { ContextMenuCommandHandlerEvents } from '@tanzanite/discord-akairo';
import { BuiltInReason } from '@tanzanite/discord-akairo/dist/src/util/Constants.js';
import { MessageFlags } from 'discord.js';

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

		switch (reason as BuiltInReason.OWNER | BuiltInReason.SUPER_USER) {
			case BuiltInReason.OWNER: {
				return await interaction.reply({
					content: `${emojis.error} Only my developers can run the ${format.input(command.id)} command.`,
					flags: MessageFlags.Ephemeral
				});
			}
			case BuiltInReason.SUPER_USER: {
				return await interaction.reply({
					content: `${emojis.error} You must be a superuser to run the ${format.input(command.id)} command.`,
					flags: MessageFlags.Ephemeral
				});
			}
			default: {
				return await interaction.reply({
					content: `${emojis.error} Command blocked with reason ${format.input(reason ?? 'unknown')}.`,
					flags: MessageFlags.Ephemeral
				});
			}
		}
	}
}
