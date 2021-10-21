import { ContextMenuCommand } from 'discord-akairo';
import { ContextMenuInteraction } from 'discord.js';
import ViewRawCommand from '../../commands/utilities/viewRaw';
import { BushMessage } from '../../lib';

export default class ViewRawContextMenuCommand extends ContextMenuCommand {
	public constructor() {
		super('viewRaw', {
			name: 'View Raw',
			type: 'MESSAGE',
			category: 'message'
		});
	}

	public override async exec(interaction: ContextMenuInteraction): Promise<unknown> {
		await interaction.deferReply({ ephemeral: true });
		const embed = await ViewRawCommand.getRawData(interaction.options.getMessage('message') as BushMessage, {
			json: false,
			js: false
		});
		return await interaction.editReply({ embeds: [embed] });
	}
}
