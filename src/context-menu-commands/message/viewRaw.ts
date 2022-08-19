import { ContextMenuCommand } from 'discord-akairo';
import { ApplicationCommandType, type ContextMenuCommandInteraction, type Message } from 'discord.js';
import ViewRawCommand from '../../commands/utilities/viewRaw.js';

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
		const embed = await ViewRawCommand.getRawData(interaction.options.getMessage('message') as Message, {
			json: false,
			js: false
		});
		return await interaction.editReply({ embeds: [embed] });
	}
}
