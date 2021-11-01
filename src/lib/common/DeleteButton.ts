import { PaginateEmojis, type BushMessage, type BushSlashMessage } from '#lib';
import { Constants, MessageActionRow, MessageButton, type MessageComponentInteraction, type MessageOptions } from 'discord.js';

export class DeleteButton {
	protected messageOptions: MessageOptions;
	protected message: BushMessage | BushSlashMessage;

	/**
	 * Sends a message with a button for the user to delete it.
	 * @param message - The message to respond to
	 * @param options - The send message options
	 */
	static async send(message: BushMessage | BushSlashMessage, options: Omit<MessageOptions, 'components'>) {
		return new DeleteButton(message, options).send();
	}

	protected constructor(message: BushMessage | BushSlashMessage, options: MessageOptions) {
		this.message = message;
		this.messageOptions = options;
	}

	protected async send() {
		this.updateComponents();

		const msg = (await this.message.util.reply(this.messageOptions)) as BushMessage;

		const collector = msg.createMessageComponentCollector({
			filter: (interaction) => interaction.customId == 'paginate__stop' && interaction.message.id == msg.id,
			time: 300000
		});

		collector.on('collect', async (interaction: MessageComponentInteraction) => {
			await interaction.deferUpdate().catch(() => undefined);
			if (interaction.user.id == this.message.author.id || client.config.owners.includes(interaction.user.id)) {
				if (msg.deletable && !msg.deleted) await msg.delete();
			}
		});

		collector.on('end', async () => {
			this.updateComponents(true, true);
			await msg.edit(this.messageOptions).catch(() => undefined);
		});
	}

	protected updateComponents(edit = false, disable = false): void {
		this.messageOptions.components = [
			new MessageActionRow().addComponents(
				new MessageButton({
					style: Constants.MessageButtonStyles.PRIMARY,
					customId: 'paginate__stop',
					emoji: PaginateEmojis.STOP,
					disabled: disable
				})
			)
		];
		if (edit) {
			this.messageOptions.reply = undefined;
		}
	}
}
