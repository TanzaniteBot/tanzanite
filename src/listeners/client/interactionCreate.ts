import { BushListener } from '@lib';
import { ButtonInteraction, CommandInteraction, Interaction, SelectMenuInteraction } from 'discord.js';

export default class InteractionCreateListener extends BushListener {
	public constructor() {
		super('interactionCreate', {
			emitter: 'client',
			event: 'interactionCreate',
			category: 'client'
		});
	}

	async exec(interaction: Interaction | CommandInteraction | ButtonInteraction | SelectMenuInteraction): Promise<unknown> {
		if (!interaction) return;
		if (interaction.isCommand()) {
			this.client.console.info(
				'SlashCommand',
				`The <<${interaction.commandName}>> command was used by <<${interaction.user.tag}>> in <<${
					interaction.channel.type == 'DM' ? interaction.channel.recipient + 's DMs' : interaction.channel.name
				}>>.`
			);
			return;
		} else if (interaction.isButton()) {
			if (interaction.customId.startsWith('paginate_')) return;
			return await interaction.reply({ content: 'Buttons go brrr', ephemeral: true });
		} else if (interaction.isSelectMenu()) {
			return await interaction.reply({
				content: `You selected ${
					Array.isArray(interaction.values)
						? this.client.util.oxford(this.client.util.surroundArray(interaction.values, '`'), 'and', '')
						: `\`${interaction.values}\``
				}.`,
				ephemeral: true
			});
		}
	}
}
