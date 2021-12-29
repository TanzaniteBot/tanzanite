import { type BushMessage, type BushSlashMessage } from '#lib';
import { MessageActionRow, MessageButton, type MessageComponentInteraction, type MessageOptions } from 'discord.js';
import { MessageButtonStyles } from 'discord.js/typings/enums';

/**
 * Sends a message with buttons for the user to confirm or cancel the action.
 */
export class ConfirmationPrompt {
	/**
	 * Options for sending the message
	 */
	protected messageOptions: MessageOptions;

	/**
	 * The message that triggered the command
	 */
	protected message: BushMessage | BushSlashMessage;

	/**
	 * @param message The message to respond to
	 * @param options The send message options
	 */
	protected constructor(message: BushMessage | BushSlashMessage, messageOptions: MessageOptions) {
		this.message = message;
		this.messageOptions = messageOptions;
	}

	/**
	 * Sends a message with buttons for the user to confirm or cancel the action.
	 */
	protected async send(): Promise<boolean> {
		this.messageOptions.components = [
			new MessageActionRow().addComponents(
				new MessageButton({
					style: MessageButtonStyles.SUCCESS,
					customId: 'confirmationPrompt__confirm',
					emoji: util.emojis.successFull,
					label: 'Yes'
				}),
				new MessageButton({
					style: MessageButtonStyles.DANGER,
					customId: 'confirmationPrompt__deny',
					emoji: util.emojis.errorFull,
					label: 'No'
				})
			)
		];

		const msg = (await this.message.util.reply(this.messageOptions)) as BushMessage;

		return await new Promise<boolean>((resolve) => {
			let responded = false;
			const collector = msg.createMessageComponentCollector({
				filter: (interaction) =>
					['confirmationPrompt__confirm', 'confirmationPrompt__deny'].includes(interaction.customId) &&
					interaction.message?.id == msg.id,
				time: 300000
			});

			collector.on('collect', async (interaction: MessageComponentInteraction) => {
				await interaction.deferUpdate().catch(() => undefined);
				if (interaction.user.id == this.message.author.id || client.config.owners.includes(interaction.user.id)) {
					if (interaction.id === 'confirmationPrompt__confirm') {
						resolve(true);
						responded = true;
						collector.stop();
					} else if (interaction.id === 'confirmationPrompt__deny') {
						resolve(false);
						responded = true;
						collector.stop();
					}
				}
			});

			collector.on('end', async () => {
				await msg.delete().catch(() => undefined);
				if (!responded) resolve(false);
			});
		});
	}

	/**
	 * Sends a message with buttons for the user to confirm or cancel the action.
	 * @param message The message to respond to
	 * @param options The send message options
	 */
	public static async send(message: BushMessage | BushSlashMessage, sendOptions: MessageOptions): Promise<boolean> {
		return new ConfirmationPrompt(message, sendOptions).send();
	}
}
