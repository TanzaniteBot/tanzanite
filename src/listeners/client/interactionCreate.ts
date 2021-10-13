import { BushButtonInteraction, BushListener } from '@lib';
import { AutoMod } from '../../lib/common/autoMod';
import { BushClientEvents } from '../../lib/extensions/discord.js/BushClientEvents';

export default class InteractionCreateListener extends BushListener {
	public constructor() {
		super('interactionCreate', {
			emitter: 'client',
			event: 'interactionCreate',
			category: 'client'
		});
	}

	public override async exec(...[interaction]: BushClientEvents['interactionCreate']): Promise<unknown> {
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
			if (interaction.customId.startsWith('paginate_') || interaction.customId.startsWith('command_')) return;
			else if (interaction.customId.startsWith('automod;'))
				void AutoMod.handleInteraction(interaction as BushButtonInteraction);
			return await interaction.reply({ content: 'Buttons go brrr', ephemeral: true });
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
