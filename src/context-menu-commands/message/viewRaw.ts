import { emojis } from '#lib';
import { ContextMenuCommand } from '@tanzanite/discord-akairo';
import { ApplicationCommandType, MessageContextMenuCommandInteraction, Routes, type APIMessage, type Message } from 'discord.js';
import { getRawData } from '../../commands/utilities/viewRaw.js';

export default class ViewRawContextMenuCommand extends ContextMenuCommand {
	public constructor() {
		super('viewRaw', {
			name: 'View Raw',
			type: ApplicationCommandType.Message,
			category: 'message'
		});
	}

	public override async exec(interaction: MessageContextMenuCommandInteraction) {
		await interaction.deferReply({ ephemeral: true });

		const message = interaction.options.getMessage('message') as Message;

		const raw = <APIMessage | null>(
			await this.client.rest.get(Routes.channelMessage(message.channel.id, message.id)).catch(() => null)
		);

		if (!raw) {
			return await interaction.editReply(`${emojis.error} There was an error fetching that message.`);
		}

		const embed = await getRawData(this.client, raw, true);
		return await interaction.editReply({ embeds: [embed] });
	}
}
