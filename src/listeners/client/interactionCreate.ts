import { AutoMod, BushListener, type BushButtonInteraction, type BushClientEvents } from '#lib';

export default class InteractionCreateListener extends BushListener {
	public constructor() {
		super('interactionCreate', {
			emitter: 'client',
			event: 'interactionCreate',
			category: 'client'
		});
	}

	public override async exec(...[interaction]: BushClientEvents['interactionCreate']) {
		if (!interaction) return;
		void client.console.verbose(
			'interactionVerbose',
			`An interaction of type <<${interaction.type.toLowerCase().replaceAll('_', '')}>> was received from <<${
				interaction.user.tag
			}>>.`
		);
		if (interaction.isCommand()) {
			return;
		} else if (interaction.isButton()) {
			const id = interaction.customId;
			if (id.startsWith('paginate_') || id.startsWith('command_') || id.startsWith('confirmationPrompt_')) return;
			else if (id.startsWith('automod;')) void AutoMod.handleInteraction(interaction as BushButtonInteraction);
			else return await interaction.reply({ content: 'Buttons go brrr', ephemeral: true });
		} else if (interaction.isSelectMenu()) {
			if (interaction.customId.startsWith('command_')) return;
			return await interaction.reply({
				content: `You selected ${
					Array.isArray(interaction.values)
						? util.oxford(util.surroundArray(interaction.values, '`'), 'and', '')
						: `\`${interaction.values}\``
				}.`,
				ephemeral: true
			});
		}
	}
}
