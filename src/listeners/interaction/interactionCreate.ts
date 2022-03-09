import { AutoMod, BushListener, type BushButtonInteraction, type BushClientEvents } from '#lib';
import { InteractionType } from 'discord-api-types/v9';

export default class InteractionCreateListener extends BushListener {
	public constructor() {
		super('interactionCreate', {
			emitter: 'client',
			event: 'interactionCreate',
			category: 'interaction'
		});
	}

	public override async exec(...[interaction]: BushClientEvents['interactionCreate']) {
		if (!interaction) return;
		if ('customId' in interaction && (interaction as any)['customId'].startsWith('test')) return;
		void client.console.verbose(
			'interactionVerbose',
			`An interaction of type <<${InteractionType[interaction.type]}>> was received from <<${interaction.user.tag}>>.`
		);
		if (interaction.isCommand()) {
			return;
		} else if (interaction.isButton()) {
			const id = interaction.customId;
			if (['paginate_', 'command_', 'confirmationPrompt_', 'appeal'].some((s) => id.startsWith(s))) return;
			else if (id.startsWith('automod;')) void AutoMod.handleInteraction(interaction as BushButtonInteraction);
			else return await interaction.reply({ content: 'Buttons go brrr', ephemeral: true });
		} else if (interaction.isSelectMenu()) {
			if (interaction.customId.startsWith('command_')) return;
			return await interaction.reply({
				content: `You selected ${
					Array.isArray(interaction.values)
						? util.oxford(util.surroundArray(interaction.values, '`'), 'and', '')
						: util.format.input(interaction.values)
				}.`,
				ephemeral: true
			});
		}
	}
}
