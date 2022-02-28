import { PaginateEmojis, type BushMessage, type BushSlashMessage } from '#lib';
import { CommandUtil } from 'discord-akairo';
import {
	ActionRow,
	ButtonComponent,
	ButtonStyle,
	MessageComponentInteraction,
	MessageEditOptions,
	MessagePayload,
	type MessageOptions
} from 'discord.js';

/**
 * Sends a message with a button for the user to delete it.
 */
export class DeleteButton {
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
	protected constructor(message: BushMessage | BushSlashMessage, options: MessageOptions) {
		this.message = message;
		this.messageOptions = options;
	}

	/**
	 * Sends a message with a button for the user to delete it.
	 */
	protected async send() {
		this.updateComponents();

		const msg = (await this.message.util.reply(this.messageOptions)) as BushMessage;

		const collector = msg.createMessageComponentCollector({
			filter: (interaction) => interaction.customId == 'paginate__stop' && interaction.message?.id == msg.id,
			time: 300000
		});

		collector.on('collect', async (interaction: MessageComponentInteraction) => {
			await interaction.deferUpdate().catch(() => undefined);
			if (interaction.user.id == this.message.author.id || client.config.owners.includes(interaction.user.id)) {
				if (msg.deletable && !CommandUtil.deletedMessages.has(msg.id)) await msg.delete();
			}
		});

		collector.on('end', async () => {
			this.updateComponents(true, true);
			await msg.edit(<string | MessagePayload | MessageEditOptions>this.messageOptions).catch(() => undefined);
		});
	}

	/**
	 * Generates the components for the message
	 * @param edit Whether or not the message is being edited
	 * @param disable Whether or not to disable the buttons
	 */
	protected updateComponents(edit = false, disable = false): void {
		this.messageOptions.components = [
			new ActionRow().addComponents(
				new ButtonComponent({
					style: ButtonStyle.Primary,
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

	/**
	 * Sends a message with a button for the user to delete it.
	 * @param message The message to respond to
	 * @param options The send message options
	 */
	public static async send(message: BushMessage | BushSlashMessage, options: Omit<MessageOptions, 'components'>) {
		return new DeleteButton(message, options).send();
	}
}
