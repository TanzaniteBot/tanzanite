import {
	Arg,
	BotCommand,
	emojis,
	format,
	regex,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import type { ArgumentGeneratorReturn, ArgumentType, ArgumentTypeCaster } from '@tanzanite/discord-akairo';
import { ApplicationCommandOptionType, Attachment, type BufferResolvable } from 'discord.js';
import { snakeCase } from 'lodash-es';
import assert from 'node:assert/strict';
import { basename } from 'node:path';
import { Stream } from 'node:stream';
import { URL } from 'node:url';

// so I don't have to retype things
const enum lang {
	emojiStart = 'What emoji would you like to steal?',
	emojiRetry = '{error} Pick a valid emoji, emoji id, or image url.',
	emojiDescription = 'The emoji to steal.',
	nameStart = 'What would you like to name the emoji?',
	nameRetry = '{error} Choose a valid name fore the emoji.',
	nameDescription = 'The name to give the new emoji.'
}

export default class StealCommand extends BotCommand {
	#defaultEmojiName = 'unnamed_emoji';

	public constructor() {
		super('steal', {
			aliases: ['steal', 'copy-emoji', 'emoji'],
			category: 'utilities',
			description: 'Steal an emoji from another server and add it to your own.',
			usage: ['steal <emoji|emojiId|url> [name]'],
			examples: ['steal <:omegaclown:782630946435366942> ironm00n'],
			slashOptions: [
				{ name: 'emoji', description: lang.emojiStart, type: ApplicationCommandOptionType.Attachment, required: true },
				{ name: 'name', description: lang.nameStart, type: ApplicationCommandOptionType.String, required: false }
			],
			helpArgs: [
				{ name: 'emoji', description: lang.emojiDescription, type: 'emoji|emojiId|url', optional: false },
				{ name: 'name', description: lang.nameDescription, type: 'string', optional: true }
			],
			slash: true,
			channel: 'guild',
			clientPermissions: ['ManageEmojisAndStickers'],
			userPermissions: ['ManageEmojisAndStickers']
		});
	}

	#hasImage(message: CommandMessage) {
		return (message.attachments.size > 0 && message.attachments.first()?.contentType?.includes('image/')) ?? false;
	}

	#emojiName(message: CommandMessage, emoji: ArgType<'discordEmoji' | 'snowflake' | 'url'>) {
		if (typeof emoji === 'string') {
			try {
				return snakeCase(basename(new URL(emoji).pathname).split('.')[0]);
			} catch {
				return this.#defaultEmojiName;
			}
		} else if ('name' in emoji && emoji.name) return emoji.name;
		else if (this.#hasImage(message) && message.attachments.first()!.name) return snakeCase(message.attachments.first()!.name);
		else return this.#defaultEmojiName;
	}

	public override *args(message: CommandMessage): ArgumentGeneratorReturn {
		/* eslint-disable @typescript-eslint/no-unsafe-assignment */
		const emoji: ArgType<'discordEmoji' | 'snowflake' | 'url'> = this.#hasImage(message)
			? message.attachments.first()!.url
			: yield {
					type: Arg.union('discordEmoji', 'snowflake', 'url') as ArgumentType | ArgumentTypeCaster,
					prompt: { start: lang.emojiStart, retry: lang.emojiRetry }
				};

		const name: OptArgType<'string'> = yield {
			prompt: { start: lang.nameStart, retry: lang.nameRetry, optional: true },
			default: this.#emojiName(message, emoji)
		};
		/* eslint-enable @typescript-eslint/no-unsafe-assignment */

		return { emoji, name };
	}

	public override async exec(
		message: CommandMessage,
		args: { emoji: OptArgType<'discordEmoji' | 'snowflake' | 'url'>; name: OptArgType<'string'> }
	) {
		assert(message.inGuild());

		if (!args.emoji) return await message.util.reply(`${emojis.error} You must provide an emoji to steal.`);

		const image =
			args.emoji instanceof URL
				? args.emoji.href
				: typeof args.emoji === 'object'
					? `https://cdn.discordapp.com/emojis/${args.emoji.id}`
					: regex.snowflake.test(args.emoji ?? '')
						? `https://cdn.discordapp.com/emojis/${args.emoji}`
						: (args.emoji ?? '').match(/https?:\/\//)
							? args.emoji
							: undefined;

		if (image == null) return await message.util.reply(`${emojis.error} You must provide an emoji to steal.`);

		const emojiName =
			(args.name ?? args.emoji instanceof URL)
				? (args.name ?? this.#defaultEmojiName)
				: typeof args.emoji === 'object'
					? (args.name ?? args.emoji.name ?? this.#defaultEmojiName)
					: this.#defaultEmojiName;

		return await this.#common(message, emojiName, image);
	}

	public override async execSlash(message: SlashMessage, args: { emoji: Attachment; name: string | null }) {
		assert(message.inGuild());

		const name = args.name ?? args.emoji.name ?? this.#defaultEmojiName;

		const data =
			args.emoji['attachment'] instanceof Stream
				? // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
					await (new Promise((resolve, reject) => {
						let data = '';
						assert(args.emoji['attachment'] instanceof Stream);
						args.emoji['attachment'].on('data', (chunk) => (data += chunk));
						args.emoji['attachment'].on('end', () => resolve(data));
						args.emoji['attachment'].on('error', (e: Error) => reject(e));
					}) as Promise<string>)
				: args.emoji['attachment'];

		return await this.#common(message, name, data);
	}

	async #common(message: CommandMessage | SlashMessage, name: string, attachment: BufferResolvable) {
		const res = await message
			.guild!.emojis.create({
				attachment,
				name,
				reason: `Stolen by ${message.author.tag} (${message.author.id})`
			})
			.catch((e: Error) => e);

		if (!(res instanceof Error)) {
			return await message.util.reply(
				`${emojis.success} You successfully stole ${res} (${format.input(res.name ?? '[emoji has no name]')}).`
			);
		} else {
			return await message.util.reply(`${emojis.error} The was an error stealing that emoji: ${format.input(res.message)}.`);
		}
	}
}
