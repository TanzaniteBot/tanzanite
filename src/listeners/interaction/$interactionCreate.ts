import { BotListener, Emitter, TanzaniteEvent, type BotClientEvents } from '#lib';
import { Events, InteractionType } from 'discord.js';

export default class InteractionCreateListener extends BotListener {
	public constructor() {
		super('interactionCreate', {
			emitter: Emitter.Client,
			event: Events.InteractionCreate
		});
	}

	public async exec(...[interaction]: BotClientEvents[Events.InteractionCreate]) {
		if (!interaction) return;

		void this.client.console.verbose(
			'interactionVerbose',
			`An interaction of type <<${InteractionType[interaction.type]}>> ${
				'customId' in interaction ? `with a custom id of <<${interaction.customId}>> ` : ''
			}was received from <<${interaction.user.tag}>>.`
		);

		if (interaction.isCommand() || interaction.isAutocomplete()) {
			// handled by the command handler
			return;
		} else if (interaction.isButton()) {
			this.client.emit(TanzaniteEvent.Button, interaction);
		} else if (interaction.isModalSubmit()) {
			this.client.emit(TanzaniteEvent.ModalSubmit, interaction);
		} else if (interaction.isStringSelectMenu()) {
			this.client.emit(TanzaniteEvent.StringSelectMenu, interaction);
		}
	}
}
