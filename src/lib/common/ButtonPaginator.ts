import { DeleteButton, type BushMessage, type BushSlashMessage } from '#lib';
import {
	Constants,
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	type MessageComponentInteraction,
	type MessageEmbedOptions
} from 'discord.js';

export class ButtonPaginator {
	protected message: BushMessage | BushSlashMessage;
	protected embeds: MessageEmbed[] | MessageEmbedOptions[];
	protected text: string | null;
	protected deleteOnExit: boolean;
	protected curPage: number;
	protected sentMessage: BushMessage | undefined;

	/**
	 * Sends multiple embeds with controls to switch between them
	 * @param message - The message to respond to
	 * @param embeds - The embeds to switch between
	 * @param text - The text send with the embeds (optional)
	 * @param deleteOnExit - Whether to delete the message when the exit button is clicked (defaults to true)
	 * @param startOn - The page to start from (**not** the index)
	 */
	public static async send(
		message: BushMessage | BushSlashMessage,
		embeds: MessageEmbed[] | MessageEmbedOptions[],
		text: string | null = null,
		deleteOnExit = true,
		startOn = 1
	) {
		// no need to paginate if there is only one page
		if (embeds.length === 1) return DeleteButton.send(message, { embeds: embeds });

		return await new ButtonPaginator(message, embeds, text, deleteOnExit, startOn).send();
	}

	protected get numPages(): number {
		return this.embeds.length;
	}

	protected constructor(
		message: BushMessage | BushSlashMessage,
		embeds: MessageEmbed[] | MessageEmbedOptions[],
		text: string | null,
		deleteOnExit: boolean,
		startOn: number
	) {
		this.message = message;
		this.embeds = embeds;
		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
		this.text = text || null;
		this.deleteOnExit = deleteOnExit;
		this.curPage = startOn - 1;

		// add footers
		for (let i = 0; i < embeds.length; i++) {
			if (embeds[i] instanceof MessageEmbed) {
				(embeds[i] as MessageEmbed).setFooter(`Page ${(i + 1).toLocaleString()}/${embeds.length.toLocaleString()}`);
			} else {
				(embeds[i] as MessageEmbedOptions).footer = {
					text: `Page ${(i + 1).toLocaleString()}/${embeds.length.toLocaleString()}`
				};
			}
		}
	}

	protected async send() {
		this.sentMessage = (await this.message.util.reply({
			content: this.text,
			embeds: [this.embeds[this.curPage]],
			components: [this.getPaginationRow()]
		})) as BushMessage;

		const collector = this.sentMessage.createMessageComponentCollector({
			filter: (i) => i.customId.startsWith('paginate_') && i.message?.id === this.sentMessage!.id,
			time: 300000
		});

		collector.on('collect', (i) => void this.collect(i));
		collector.on('end', () => void this.end());
	}

	protected async collect(interaction: MessageComponentInteraction) {
		if (interaction.user.id !== this.message.author.id && !client.config.owners.includes(interaction.user.id))
			return await interaction?.deferUpdate().catch(() => null);

		switch (interaction.customId) {
			case 'paginate_beginning':
				this.curPage = 0;
				return this.edit(interaction);
			case 'paginate_back':
				this.curPage--;
				return await this.edit(interaction);
			case 'paginate_stop':
				if (this.deleteOnExit) {
					await interaction.deferUpdate().catch(() => null);
					return await this.sentMessage!.delete().catch(() => null);
				} else {
					return await interaction
						?.update({
							content: `${this.text ? `${this.text}\n` : ''}Command closed by user.`,
							embeds: [],
							components: []
						})
						.catch(() => null);
				}
			case 'paginate_next':
				this.curPage++;
				return await this.edit(interaction);
			case 'paginate_end':
				this.curPage = this.embeds.length - 1;
				return await this.edit(interaction);
		}
	}

	protected async end() {
		if (this.sentMessage && !this.sentMessage.deleted)
			return await this.sentMessage
				.edit({
					content: this.text,
					embeds: [this.embeds[this.curPage]],
					components: [this.getPaginationRow(true)]
				})
				.catch(() => null);
	}

	protected async edit(interaction: MessageComponentInteraction) {
		return interaction
			?.update({
				content: this.text,
				embeds: [this.embeds[this.curPage]],
				components: [this.getPaginationRow()]
			})
			.catch(() => null);
	}

	protected getPaginationRow(disableAll = false): MessageActionRow {
		return new MessageActionRow().addComponents(
			new MessageButton({
				style: Constants.MessageButtonStyles.PRIMARY,
				customId: 'paginate_beginning',
				emoji: PaginateEmojis.BEGGING,
				disabled: disableAll || this.curPage === 0
			}),
			new MessageButton({
				style: Constants.MessageButtonStyles.PRIMARY,
				customId: 'paginate_back',
				emoji: PaginateEmojis.BACK,
				disabled: disableAll || this.curPage === 0
			}),
			new MessageButton({
				style: Constants.MessageButtonStyles.PRIMARY,
				customId: 'paginate_stop',
				emoji: PaginateEmojis.STOP,
				disabled: disableAll
			}),
			new MessageButton({
				style: Constants.MessageButtonStyles.PRIMARY,
				customId: 'paginate_next',
				emoji: PaginateEmojis.FORWARD,
				disabled: disableAll || this.curPage === this.numPages - 1
			}),
			new MessageButton({
				style: Constants.MessageButtonStyles.PRIMARY,
				customId: 'paginate_end',
				emoji: PaginateEmojis.END,
				disabled: disableAll || this.curPage === this.numPages - 1
			})
		);
	}
}

export const enum PaginateEmojis {
	BEGGING = '853667381335162910',
	BACK = '853667410203770881',
	STOP = '853667471110570034',
	FORWARD = '853667492680564747',
	END = '853667514915225640'
}
