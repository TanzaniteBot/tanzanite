import { ViewRawCommand } from '#commands';
import { type BushMessage } from '#lib';
import { ContextMenuCommand } from 'discord-akairo';
import { ApplicationCommandType, type ContextMenuCommandInteraction } from 'discord.js';

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
		const embed = await ViewRawCommand.getRawData(interaction.options.getMessage('message') as BushMessage, {
			json: false,
			js: false
		});
		return await interaction.editReply({ embeds: [embed] });
	}
}
