import { BushCommand, OptArgType, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import { type ArgumentGeneratorReturn, type ArgumentType, type ArgumentTypeCaster } from 'discord-akairo';
import { ApplicationCommandOptionType, PermissionFlagsBits, type Attachment } from 'discord.js';
import _ from 'lodash';
import { Stream } from 'stream';
import { URL } from 'url';

assert(_);

// so I don't have to retype things
const enum lang {
	emojiStart = 'What emoji would you like to steal?',
	emojiRetry = '{error} Pick a valid emoji, emoji id, or image url.',
	emojiDescription = 'The emoji to steal.',
	nameStart = 'What would you like to name the emoji?',
	nameRetry = '{error} Choose a valid name fore the emoji.',
	nameDescription = 'The name to give the new emoji.'
}

export default class StealCommand extends BushCommand {
	public constructor() {
		super('steal', {
			aliases: ['steal', 'copy-emoji', 'emoji'],
			category: 'utilities',
			description: 'Steal an emoji from another server and add it to your own.',
			usage: ['steal <emoji/emojiId/url> [name]'],
			examples: ['steal <:omegaclown:782630946435366942> ironm00n'],
			slashOptions: [
				{ name: 'emoji', description: lang.emojiStart, type: ApplicationCommandOptionType.Attachment, required: true },
				{ name: 'name', description: lang.nameStart, type: ApplicationCommandOptionType.String, required: false }
			],
			helpArgs: [
				{ id: 'emoji', description: lang.emojiDescription, readableType: 'emoji|emojiId|url', optional: false },
				{ id: 'name', description: lang.nameDescription, readableType: 'string', optional: true }
			],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [PermissionFlagsBits.ManageEmojisAndStickers]),
			userPermissions: [PermissionFlagsBits.ManageEmojisAndStickers]
		});
	}

	public override *args(message: BushMessage): ArgumentGeneratorReturn {
		const hasImage = message.attachments.size && message.attachments.first()?.contentType?.includes('image/');

		const emoji = hasImage
			? message.attachments.first()!.url
			: yield {
					type: util.arg.union('discordEmoji', 'snowflake', 'url') as ArgumentType | ArgumentTypeCaster,
					prompt: { start: lang.emojiStart, retry: lang.emojiRetry }
			  };

		const name = yield {
			prompt: { start: lang.nameStart, retry: lang.nameRetry, optional: true },
			default: hasImage && message.attachments.first()!.name ? _.snakeCase(message.attachments.first()!.name!) : 'unnamed_emoji'
		};

		return { emoji, name };
	}

	public override async exec(
		message: BushMessage,
		args: { emoji: OptArgType<'discordEmoji'> | OptArgType<'snowflake'> | OptArgType<'url'> | string; name: string }
	) {
		assert(message.inGuild());

		if (!args.emoji) return await message.util.reply(`${util.emojis.error} You must provide an emoji to steal.`);

		const image =
			args.emoji instanceof URL
				? args.emoji.href
				: typeof args.emoji === 'object'
				? `https://cdn.discordapp.com/emojis/${args.emoji.id}`
				: client.consts.regex.snowflake.test(args.emoji ?? '')
				? `https://cdn.discordapp.com/emojis/${args!.emoji}`
				: (args.emoji ?? '').match(/https?:\/\//)
				? args.emoji
				: undefined;

		if (image === undefined) return await message.util.reply(`${util.emojis.error} You must provide an emoji to steal.`);

		const emojiName =
			args.name ?? args.emoji instanceof URL
				? args.name ?? 'stolen_emoji'
				: typeof args.emoji === 'object'
				? args.name ?? args.emoji.name ?? 'stolen_emoji'
				: 'stolen_emoji';

		const creationSuccess = await message.guild.emojis
			.create(image, emojiName, {
				reason: `Stolen by ${message.author.tag} (${message.author.id})`
			})
			.catch((e: Error) => e);

		if (!(creationSuccess instanceof Error))
			return await message.util.reply(`${util.emojis.success} You successfully stole ${creationSuccess}.`);
		else {
			return await message.util.reply(
				`${util.emojis.error} The was an error stealing that emoji \`${creationSuccess.message}\`.`
			);
		}
	}

	public override async execSlash(message: BushSlashMessage, args: { emoji: Attachment; name?: string }) {
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

		const creationSuccess = await message.guild.emojis
			.create(data, name, {
				reason: `Stolen by ${message.author.tag} (${message.author.id})`
			})
			.catch((e: Error) => e);

		if (!(creationSuccess instanceof Error))
			return await message.util.reply(`${util.emojis.success} You successfully stole ${creationSuccess}.`);
		else {
			return await message.util.reply(
				`${util.emojis.error} The was an error stealing that emoji \`${creationSuccess.message}\`.`
			);
		}
	}
}
