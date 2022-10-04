import { BotClientEvents, BotListener, Emitter, format, formatList, surroundEach, TanzaniteEvent } from '#lib';

export default class SelectMenuListener extends BotListener {
	public constructor() {
		super(TanzaniteEvent.SelectMenu, {
			emitter: Emitter.Client,
			event: TanzaniteEvent.SelectMenu
		});
	}

	public async exec(...[interaction]: BotClientEvents[TanzaniteEvent.SelectMenu]) {
		if (interaction.customId.startsWith('command_')) return;

		return await interaction.reply({
			content: `You selected ${
				Array.isArray(interaction.values)
					? formatList(surroundEach(interaction.values, '`'), 'and')
					: format.input(interaction.values)
			}.`,
			ephemeral: true
		});
	}
}
