import { PaginateEmojis, type CommandMessage, type SlashMessage } from '#lib';
import { CommandUtil } from '@tanzanite/discord-akairo';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	type BaseMessageOptions,
	type MessageComponentInteraction,
	type MessageCreateOptions,
	type MessageEditOptions,
	type MessagePayload
} from 'discord.js';

/**
 * Sends a message with a button for the user to delete it.
 */
export class DeleteButton {
	/**
	 * @param message The message to respond to
	 * @param messageOptions The send message options
	 */
	protected constructor(
		protected message: CommandMessage | SlashMessage,
		protected messageOptions: MessageCreateOptions,
		protected appendComponents: NonNullable<BaseMessageOptions['components']>
	) {}

	/**
	 * Sends a message with a button for the user to delete it.
	 */
	protected async send() {
		this.updateComponents();

		const msg = await this.message.util.reply(this.messageOptions);

		const collector = msg.createMessageComponentCollector({
			componentType: ComponentType.Button,
			filter: (interaction) => interaction.customId == 'paginate__stop' && interaction.message?.id == msg.id,
			time: 300000
		});

		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		collector.on('collect', async (interaction: MessageComponentInteraction) => {
			await interaction.deferUpdate().catch(() => undefined);
			if (interaction.user.id == this.message.author.id || this.message.client.config.owners.includes(interaction.user.id)) {
				if (msg.deletable && !CommandUtil.deletedMessages.has(msg.id)) await msg.delete();
			}
		});

		// eslint-disable-next-line @typescript-eslint/no-misused-promises
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
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder({
					style: ButtonStyle.Primary,
					custom_id: 'paginate__stop',
					emoji: PaginateEmojis.STOP,
					disabled: disable
				})
			),
			...this.appendComponents
		];
		if (edit) {
			this.messageOptions.messageReference = undefined;
		}
	}

	/**
	 * Sends a message with a button for the user to delete it.
	 * @param message The message to respond to
	 * @param options The send message options
	 */
	public static async send(
		message: CommandMessage | SlashMessage,
		options: Omit<MessageCreateOptions, 'components'>,
		appendComponents: NonNullable<BaseMessageOptions['components']> = []
	) {
		return new DeleteButton(message, options, appendComponents).send();
	}
}
