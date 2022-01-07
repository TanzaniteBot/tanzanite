import { ViewRawCommand } from '#commands';
import { type BushMessage } from '#lib';
import { ContextMenuCommand } from 'discord-akairo';
import { type ContextMenuInteraction } from 'discord.js';

export default class ViewRawContextMenuCommand extends ContextMenuCommand {
	public constructor() {
		super('viewRaw', {
			name: 'View Raw',
			type: 'MESSAGE',
			category: 'message'
		});
	}

	public override async exec(interaction: ContextMenuInteraction) {
		await interaction.deferReply({ ephemeral: true });
		const embed = await ViewRawCommand.getRawData(interaction.options.getMessage('message') as BushMessage, {
			json: false,
			js: false
		});
		return await interaction.editReply({ embeds: [embed] });
	}
}
