import { Arg, BotCommand, emojis, format, OptArgType, regex, type CommandMessage, type SlashMessage } from '#lib';
import { type ArgumentGeneratorReturn, type ArgumentType, type ArgumentTypeCaster } from '@notenoughupdates/discord-akairo';
import { ApplicationCommandOptionType, Attachment } from 'discord.js';
import { snakeCase } from 'lodash-es';
import assert from 'node:assert/strict';
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

	public override *args(message: CommandMessage): ArgumentGeneratorReturn {
		const hasImage = message.attachments.size && message.attachments.first()?.contentType?.includes('image/');

		const emoji = hasImage
			? message.attachments.first()!.url
			: yield {
					type: Arg.union('discordEmoji', 'snowflake', 'url') as ArgumentType | ArgumentTypeCaster,
					prompt: { start: lang.emojiStart, retry: lang.emojiRetry }
			  };

		const name = yield {
			prompt: { start: lang.nameStart, retry: lang.nameRetry, optional: true },
			default:
				'name' in emoji && emoji.name
					? emoji.name
					: hasImage && message.attachments.first()!.name
					? snakeCase(message.attachments.first()!.name!)
					: 'unnamed_emoji'
		};

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
				? `https://cdn.discordapp.com/emojis/${args!.emoji}`
				: (args.emoji ?? '').match(/https?:\/\//)
				? args.emoji
				: undefined;

		if (image === undefined) return await message.util.reply(`${emojis.error} You must provide an emoji to steal.`);

		const emojiName =
			args.name ?? args.emoji instanceof URL
				? args.name ?? 'stolen_emoji'
				: typeof args.emoji === 'object'
				? args.name ?? args.emoji.name ?? 'stolen_emoji'
				: 'stolen_emoji';

		const res = await message.guild.emojis
			.create({
				attachment: image,
				name: emojiName,
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

	public override async execSlash(message: SlashMessage, args: { emoji: Attachment; name: string | null }) {
		assert(message.inGuild());

		const name = args.name ?? args.emoji.name ?? 'stolen_emoji';

		const data =
			args.emoji.attachment instanceof Stream
				? await (new Promise((resolve, reject) => {
						let data = '';
						assert(args.emoji.attachment instanceof Stream);
						args.emoji.attachment.on('data', (chunk) => (data += chunk));
						args.emoji.attachment.on('end', () => resolve(data));
						args.emoji.attachment.on('error', (e) => reject(e));
				  }) as Promise<string>)
				: args.emoji.attachment;

		const res = await message.guild.emojis
			.create({
				attachment: data,
				name: name,
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
