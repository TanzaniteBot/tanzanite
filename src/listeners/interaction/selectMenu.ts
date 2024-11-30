import { BotListener, Emitter, TanzaniteEvent, format, formatList, surroundEach, type BotClientEvents } from '#lib';
import { MessageFlags } from 'discord.js';

export default class SelectMenuListener extends BotListener {
	public constructor() {
		super(TanzaniteEvent.StringSelectMenu, {
			emitter: Emitter.Client,
			event: TanzaniteEvent.StringSelectMenu
		});
	}

	public async exec(...[interaction]: BotClientEvents[TanzaniteEvent.StringSelectMenu]) {
		if (interaction.customId.startsWith('command_')) return;

		return await interaction.reply({
			content: `You selected ${
				Array.isArray(interaction.values)
					? formatList(surroundEach(interaction.values, '`'), 'and')
					: format.input(interaction.values)
			}.`,
			flags: MessageFlags.Ephemeral
		});
	}
}
