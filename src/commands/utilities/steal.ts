import { BushCommand, BushMessage } from '@lib';
import { Snowflake } from 'discord-api-types';

export default class StealCommand extends BushCommand {
	public constructor() {
		super('steal', {
			aliases: ['steal', 'copy-emoji'],
			category: 'utilities',
			description: {
				content: 'Steal an emoji from another server and add it to your own.',
				usage: ['steal <emoji/emojiId/url> [name]'],
				examples: ['steal <:omegaclown:782630946435366942> ironm00n']
			},
			args: [
				{
					id: 'emojiOrName',
					customType: util.arg.union('discordEmoji', 'snowflake', 'url'),
					prompt: {
						start: 'What emoji would you like to steal?',
						retry: '{error} Pick a valid emoji, emoji id, or image url.',
						optional: true
					}
				},
				{
					id: 'name2'
				}
			],
			slash: false,
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['MANAGE_EMOJIS_AND_STICKERS']),
			userPermissions: ['MANAGE_EMOJIS_AND_STICKERS']
		});
	}
	public override async exec(
		message: BushMessage,
		args?: { emojiOrName?: { name: string; id: Snowflake } | Snowflake | URL | string; name2: string }
	) {
		if ((!args || !args.emojiOrName) && !message.attachments.size)
			return await message.util.reply(`${util.emojis.error} You must provide an emoji to steal.`);

		const image =
			message.attachments.size && message.attachments.first()?.contentType?.includes('image/')
				? message.attachments.first()!.url
				: args?.emojiOrName instanceof URL
				? args.emojiOrName.href
				: typeof args?.emojiOrName === 'object'
				? `https://cdn.discordapp.com/emojis/${args.emojiOrName.id}`
				: client.consts.regex.snowflake.test(args?.emojiOrName ?? '')
				? `https://cdn.discordapp.com/emojis/${args!.emojiOrName}`
				: undefined;

		if (image === undefined) return await message.util.reply(`${util.emojis.error} You must provide an emoji to steal.`);
		if (message.attachments.size && typeof args?.emojiOrName !== 'string')
			return await message.util.reply(`${util.emojis.error} You cannot attach an image and provide an argument.`);

		const emojiName = message.attachments.size
			? (args?.emojiOrName as string) ?? 'stolen_emoji'
			: args?.emojiOrName instanceof URL
			? args?.name2 ?? 'stolen_emoji'
			: typeof args?.emojiOrName === 'object'
			? args?.name2 ?? args.emojiOrName.name ?? 'stolen_emoji'
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
