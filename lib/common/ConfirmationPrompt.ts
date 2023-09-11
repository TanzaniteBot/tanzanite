import type { CommandMessage, SlashMessage } from '#lib';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	type MessageComponentInteraction,
	type MessageCreateOptions
} from 'discord.js';

/**
 * Sends a message with buttons for the user to confirm or cancel the action.
 */
export class ConfirmationPrompt {
	/**
	 * @param message The message that triggered the command
	 * @param messageOptions Options for sending the message
	 */
	protected constructor(
		protected message: CommandMessage | SlashMessage,
		protected messageOptions: MessageCreateOptions
	) {}

	/**
	 * Sends a message with buttons for the user to confirm or cancel the action.
	 */
	protected async send(): Promise<boolean> {
		this.messageOptions.components = [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder({ style: ButtonStyle.Success, customId: 'confirmationPrompt_confirm', label: 'Yes' }),
				new ButtonBuilder({ style: ButtonStyle.Danger, customId: 'confirmationPrompt_cancel', label: 'No' })
			)
		];

		const msg = await this.message.channel!.send(this.messageOptions);

		return await new Promise<boolean>((resolve) => {
			let responded = false;
			const collector = msg.createMessageComponentCollector({
				componentType: ComponentType.Button,
				filter: (interaction) => interaction.message?.id == msg.id,
				time: 300_000
			});

			collector.on('collect', async (interaction: MessageComponentInteraction) => {
				await interaction.deferUpdate().catch(() => {});
				if (interaction.user.id == this.message.author.id || this.message.client.config.owners.includes(interaction.user.id)) {
					if (interaction.customId === 'confirmationPrompt_confirm') {
						responded = true;
						collector.stop();
						resolve(true);
					} else if (interaction.customId === 'confirmationPrompt_cancel') {
						responded = true;
						collector.stop();
						resolve(false);
					}
				}
			});

			collector.on('end', async () => {
				await msg.delete().catch(() => {});
				if (!responded) resolve(false);
			});
		});
	}

	/**
	 * Sends a message with buttons for the user to confirm or cancel the action.
	 * @param message The message that triggered the command
	 * @param sendOptions Options for sending the message
	 */
	public static async send(message: CommandMessage | SlashMessage, sendOptions: MessageCreateOptions): Promise<boolean> {
		return new ConfirmationPrompt(message, sendOptions).send();
	}
}
