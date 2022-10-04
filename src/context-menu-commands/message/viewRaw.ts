import { ContextMenuCommand } from '@notenoughupdates/discord-akairo';
import { ApplicationCommandType, type ContextMenuCommandInteraction, type Message } from 'discord.js';
import { getRawData } from '../../commands/utilities/viewRaw.js';

export default class ViewRawContextMenuCommand extends ContextMenuCommand {
	public constructor() {
		super('viewRaw', {
			name: 'View Raw',
			type: ApplicationCommandType.Message,
			category: 'message'
		});
	}

	public override async exec(interaction: ContextMenuCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });

		const message = interaction.options.getMessage('message') as Message;

		const embed = await getRawData(message, {
			json: false,
			js: false
		});
		return await interaction.editReply({ embeds: [embed] });
	}
}
