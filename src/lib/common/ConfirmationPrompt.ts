import { type BushMessage, type BushSlashMessage } from '#lib';
import { ActionRow, ButtonComponent, ButtonStyle, type MessageComponentInteraction, type MessageOptions } from 'discord.js';

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
			new ActionRow().addComponents(
				new ButtonComponent()
					// @ts-expect-error: outdated @discord.js/builders
					.setStyle(ButtonStyle.Primary)
					.setCustomId('confirmationPrompt_confirm')
					.setEmoji({ id: util.emojisRaw.successFull, name: 'successFull', animated: false })
					.setLabel('Yes'),
				new ButtonComponent()
					// @ts-expect-error: outdated @discord.js/builders
					.setStyle(ButtonStyle.Danger)
					.setCustomId('confirmationPrompt_cancel')
					.setEmoji({ id: util.emojisRaw.errorFull, name: 'errorFull', animated: false })
					.setLabel('No')
			)
		];

		const msg = (await this.message.util.sendNew(this.messageOptions)) as BushMessage;

		return await new Promise<boolean>((resolve) => {
			let responded = false;
			const collector = msg.createMessageComponentCollector({
				filter: (interaction) => interaction.message?.id == msg.id,
				time: 300_000
			});

			collector.on('collect', async (interaction: MessageComponentInteraction) => {
				await interaction.deferUpdate().catch(() => undefined);
				if (interaction.user.id == this.message.author.id || client.config.owners.includes(interaction.user.id)) {
					if (interaction.customId === 'confirmationPrompt_confirm') {
						resolve(true);
						responded = true;
						collector.stop();
					} else if (interaction.customId === 'confirmationPrompt_deny') {
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
