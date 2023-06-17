import { DeleteButton, Time, type CommandMessage, type SlashMessage } from '#lib';
import { CommandUtil } from '@notenoughupdates/discord-akairo';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	EmbedBuilder,
	type BaseMessageOptions,
	type Message,
	type MessageComponentInteraction,
	type MessageCreateOptions
} from 'discord.js';

/**
 * Sends multiple embeds with controls to switch between them
 */
export class ButtonPaginator {
	/**
	 * The current page of the paginator
	 */
	protected curPage: number;

	/**
	 * The paginator message
	 */
	protected sentMessage: Message | undefined;

	/**
	 * @param message The message that triggered the command
	 * @param pages The embeds to switch between
	 * @param options Additional message send options such as text
	 * @param {} [deleteOnExit=true] Whether the paginator message gets deleted when the exit button is pressed
	 * @param startOn The **page** to start from (**not** the index)
	 * @param appendComponents Components to append to the bottom of the message
	 */
	protected constructor(
		protected message: CommandMessage | SlashMessage,
		protected pages: PageData[],
		protected options: Omit<MessageCreateOptions, 'components' | 'embeds' | 'flags'>,
		protected deleteOnExit: boolean,
		startOn: number,
		protected timeout: Time
	) {
		this.curPage = startOn - 1;

		// add footers
		for (let i = 0; i < pages.length; i++) {
			const page = pages[i];
			if (page.embed instanceof EmbedBuilder) {
				const prepend = page.embed.data.footer?.text ? `${page.embed.data.footer.text} | ` : '';
				page.embed.setFooter({ text: `${prepend}Page ${(i + 1).toLocaleString()}/${pages.length.toLocaleString()}` });
			} else {
				if ('toJSON' in page.embed) {
					page.embed = page.embed.toJSON();
				}

				const prepend = page.embed.footer?.text ? `${page.embed.footer.text} | ` : '';
				page.embed.footer = {
					text: `${prepend}Page ${(i + 1).toLocaleString()}/${pages.length.toLocaleString()}`
				};
			}
		}
	}

	/**
	 * The number of pages in the paginator
	 */
	protected get numPages(): number {
		return this.pages.length;
	}

	/**
	 * Sends the paginator message
	 */
	protected async send() {
		this.sentMessage = await this.message.util.reply({
			...this.options,
			embeds: [this.pages[this.curPage].embed],
			components: this.getComponents()
		});

		const collector = this.sentMessage.createMessageComponentCollector({
			componentType: ComponentType.Button,
			filter: (i) => i.customId.startsWith('paginate_'),
			time: this.timeout
		});
		collector.on('collect', (i) => void this.collect(i));
		collector.on('end', () => void this.end());
	}

	/**
	 * Handles interactions with the paginator
	 * @param interaction The interaction received
	 */
	protected async collect(interaction: MessageComponentInteraction) {
		if (interaction.user.id !== this.message.author.id && !this.message.client.config.owners.includes(interaction.user.id))
			return await interaction?.deferUpdate().catch(() => null);

		switch (interaction.customId) {
			case 'paginate_beginning':
				this.curPage = 0;
				await this.edit(interaction);
				break;
			case 'paginate_back':
				this.curPage--;
				await this.edit(interaction);
				break;
			case 'paginate_stop':
				if (this.deleteOnExit) {
					await interaction.deferUpdate().catch(() => null);
					await this.sentMessage!.delete().catch(() => null);
					break;
				} else {
					await interaction
						?.update({
							...this.options,
							content: `${this.options.content ? `${this.options.content}\n` : ''}Command closed by user.`,
							embeds: [],
							components: []
						})
						.catch(() => null);
					break;
				}
			case 'paginate_next':
				this.curPage++;
				await this.edit(interaction);
				break;
			case 'paginate_end':
				this.curPage = this.pages.length - 1;
				await this.edit(interaction);
				break;
		}
	}

	/**
	 * Ends the paginator
	 */
	protected async end() {
		if (this.sentMessage && !CommandUtil.deletedMessages.has(this.sentMessage.id))
			await this.sentMessage
				.edit({
					...this.options,
					embeds: [this.pages[this.curPage].embed],
					components: this.getComponents(true)
				})
				.catch(() => null);
	}

	/**
	 * Edits the paginator message
	 * @param interaction The interaction received
	 */
	protected async edit(interaction: MessageComponentInteraction) {
		await interaction
			?.update({
				...this.options,
				embeds: [this.pages[this.curPage].embed],
				components: this.getComponents()
			})
			.catch(() => null);
	}

	/**
	 * Generates the pagination row based on the class properties
	 * @param disableAll Whether to disable all buttons
	 * @returns The generated {@link ActionRow}
	 */
	protected getPaginationRow(disableAll = false) {
		return new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder({
				style: ButtonStyle.Primary,
				customId: 'paginate_beginning',
				emoji: PaginateEmojis.BEGINNING,
				disabled: disableAll || this.curPage === 0
			}),
			new ButtonBuilder({
				style: ButtonStyle.Primary,
				customId: 'paginate_back',
				emoji: PaginateEmojis.BACK,
				disabled: disableAll || this.curPage === 0
			}),
			new ButtonBuilder({
				style: ButtonStyle.Primary,
				customId: 'paginate_stop',
				emoji: PaginateEmojis.STOP,
				disabled: disableAll
			}),
			new ButtonBuilder({
				style: ButtonStyle.Primary,
				customId: 'paginate_next',
				emoji: PaginateEmojis.FORWARD,
				disabled: disableAll || this.curPage === this.numPages - 1
			}),
			new ButtonBuilder({
				style: ButtonStyle.Primary,
				customId: 'paginate_end',
				emoji: PaginateEmojis.END,
				disabled: disableAll || this.curPage === this.numPages - 1
			})
		);
	}

	/**
	 * Generates the pagination row and appends the components to the bottom
	 * @param disableAll Whether to disable all buttons
	 * @returns The generated {@link ActionRow} and appended components
	 */
	protected getComponents(disableAll = false): NonNullable<BaseMessageOptions['components']> {
		return [this.getPaginationRow(disableAll), ...this.pages[this.curPage].appendComponents];
	}

	/**
	 * Sends multiple embeds with controls to switch between them with corresponding appended components.
	 * @param message The message to respond to
	 * @param pages The pairs of embeds and components to switch between
	 * @param options Additional message send options such as text (optional)
	 * @param deleteOnExit Whether to delete the message when the exit button is clicked (defaults to true)
	 * @param startOn The **page** to start from (**not** the index, defaults to 1)
	 */
	public static async send(
		message: CommandMessage | SlashMessage,
		pages: PageData[],
		options?: Omit<MessageCreateOptions, 'components' | 'embeds'>,
		deleteOnExit?: boolean,
		startOn?: number,
		timeout?: Time
	): Promise<void>;
	/**
	 * Sends multiple embeds with controls to switch between them with optional constant appended components.
	 * @param message The message to respond to
	 * @param embeds The embeds and components to switch between
	 * @param options Additional message send options such as text (optional)
	 * @param deleteOnExit Whether to delete the message when the exit button is clicked (defaults to true)
	 * @param startOn The **page** to start from (**not** the index, defaults to 1)
	 * @param appendComponents Components to append to the bottom of the message -- doesn't change between pages
	 */
	public static async send(
		message: CommandMessage | SlashMessage,
		embeds: NonNullable<BaseMessageOptions['embeds']>,
		options?: Omit<MessageCreateOptions, 'components' | 'embeds'>,
		deleteOnExit?: boolean,
		startOn?: number,
		timeout?: Time,
		appendComponents?: NonNullable<BaseMessageOptions['components']>
	): Promise<void>;
	public static async send(
		message: CommandMessage | SlashMessage,
		embedsOrPages: NonNullable<BaseMessageOptions['embeds']> | PageData[],
		options: Omit<MessageCreateOptions, 'components' | 'embeds'> = {},
		deleteOnExit = true,
		startOn = 1,
		timeout: Time = 5 * Time.Minute,
		appendComponents?: NonNullable<BaseMessageOptions['components']>
	) {
		if (embedsOrPages.length === 0) throw new Error('You must provide at least one embed.');

		const pages = isPageData(embedsOrPages)
			? embedsOrPages
			: embedsOrPages.map((embed) => ({ embed, appendComponents: appendComponents ?? [] } satisfies PageData));

		for (let i = 0; i < pages.length; i++) {
			const page = pages[i];
			if (page.appendComponents.length > 4) {
				throw new Error('You can only append up to 4 components to the paginator.', {
					cause: `page ${i + 1} (index ${i}) has ${page.appendComponents.length} components appended to it (max 4)`
				});
			}
		}

		// no need to paginate if there is only one page
		if (pages.length === 1) {
			return DeleteButton.send(message, { embeds: [pages[0].embed], ...options }, pages[0].appendComponents);
		}

		return await new ButtonPaginator(message, pages, options, deleteOnExit, startOn, timeout).send();
	}
}

export interface PageData {
	/**
	 * The embeds to switch between
	 */
	embed: NonNullable<BaseMessageOptions['embeds']>[number];
	/**
	 * Up to 4 action rows of components to append after the pagination row
	 */
	appendComponents: NonNullable<BaseMessageOptions['components']>;
}

// makes typescript happy
function isPageData(array: Array<Record<string, any>>): array is PageData[] {
	return 'embed' in array[0] && 'appendComponents' in array[0];
}

export const PaginateEmojis = {
	BEGINNING: { id: '853667381335162910', name: 'w_paginate_beginning', animated: false } as const,
	BACK: { id: '853667410203770881', name: 'w_paginate_back', animated: false } as const,
	STOP: { id: '853667471110570034', name: 'w_paginate_stop', animated: false } as const,
	FORWARD: { id: '853667492680564747', name: 'w_paginate_next', animated: false } as const,
	END: { id: '853667514915225640', name: 'w_paginate_end', animated: false } as const
} as const;
