import { BushCommand, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
import { type ArgumentOptions, type ArgumentType, type ArgumentTypeCaster, type Flag } from 'discord-akairo';
import _ from 'lodash';
import { URL } from 'url';

export default class StealCommand extends BushCommand {
	public constructor() {
		super('steal', {
			aliases: ['steal', 'copy-emoji'],
			category: 'utilities',
			description: 'Steal an emoji from another server and add it to your own.',
			usage: ['steal <emoji/emojiId/url> [name]'],
			examples: ['steal <:omegaclown:782630946435366942> ironm00n'],
			args: [
				{
					id: 'emoji',
					description: 'The emoji to steal.',
					type: util.arg.union('discordEmoji', 'snowflake', 'url'),
					readableType: 'discordEmoji|snowflake|url',
					prompt: 'What emoji would you like to steal?',
					retry: '{error} Pick a valid emoji, emoji id, or image url.',
					optional: true,
					only: 'slash',
					slashType: 'STRING'
				},
				{
					id: 'name',
					description: 'The name to give the new emoji.',
					prompt: 'What would you like to name the emoji?',
					retry: '{error} Choose a valid name fore the emoji.',
					optional: true,
					only: 'slash',
					slashType: 'STRING'
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['MANAGE_EMOJIS_AND_STICKERS']),
			userPermissions: ['MANAGE_EMOJIS_AND_STICKERS']
		});
	}

	public override *args(message: BushMessage): Generator<ArgumentOptions | Flag> {
		const hasImage = message.attachments.size && message.attachments.first()?.contentType?.includes('image/');

		const emoji = hasImage
			? message.attachments.first()!.url
			: yield {
					id: 'emoji',
					type: util.arg.union('discordEmoji', 'snowflake', 'url') as ArgumentType | ArgumentTypeCaster,
					prompt: {
						start: 'What emoji would you like to steal?',
						retry: '{error} Pick a valid emoji, emoji id, or image url.'
					}
			  };

		const name = yield {
			id: 'name',
			prompt: {
				start: 'What would you like to name the emoji?',
				retry: '{error} Choose a valid name fore the emoji.',
				optional: true
			},
			default:
				hasImage && message.attachments.first()?.name
					? _.camelCase(message.attachments.first()!.name ?? 'stolen_emoji')
					: 'stolen_emoji'
		};

		return { emoji, name };
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args?: { emoji?: ArgType<'discordEmoji'> | ArgType<'snowflake'> | ArgType<'url'> | string; name: string }
	) {
		if (!args || !args.emoji) return await message.util.reply(`${util.emojis.error} You must provide an emoji to steal.`);

		const image =
			args?.emoji instanceof URL
				? args.emoji.href
				: typeof args?.emoji === 'object'
				? `https://cdn.discordapp.com/emojis/${args.emoji.id}`
				: client.consts.regex.snowflake.test(args?.emoji ?? '')
				? `https://cdn.discordapp.com/emojis/${args!.emoji}`
				: (args?.emoji ?? '').match(/https?:\/\//)
				? args?.emoji
				: undefined;

		if (image === undefined) return await message.util.reply(`${util.emojis.error} You must provide an emoji to steal.`);

		const emojiName =
			args.name ?? args?.emoji instanceof URL
				? args?.name ?? 'stolen_emoji'
				: typeof args?.emoji === 'object'
				? args?.name ?? args.emoji.name ?? 'stolen_emoji'
				: 'stolen_emoji';

		const creationSuccess = await message
			.guild!.emojis.create(image, emojiName, {
				reason: `Stolen by ${message.author.tag} (${message.author.id})`
			})
			.catch((e: Error) => e);

		if (!(creationSuccess instanceof Error))
			return await message.util.reply(`${util.emojis.success} You successfully stole ${creationSuccess}.`);
		else
			return await message.util.reply(
				`${util.emojis.error} The was an error stealing that emoji \`${creationSuccess.message}\`.`
			);
	}
}
