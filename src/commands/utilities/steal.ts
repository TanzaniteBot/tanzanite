import { BushCommand, BushMessage } from '@lib';
import { Emoji } from 'discord.js';

export default class StealCommand extends BushCommand {
	public constructor() {
		super('steal', {
			aliases: ['steal', 'copyemoji'],
			category: 'utilities',
			description: {
				content: 'Steal an emoji from another server and add it to your own.',
				usage: 'steal <emoji/url> [--name name]',
				examples: ['steal <:omegaclown:782630946435366942> --name ironm00n']
			},
			args: [
				{
					id: 'emoji',
					customType: util.arg.union('emoji', 'url'),
					prompt: {
						start: 'What emoji would you like to steal?',
						retry: '{error} Pick a valid emoji.',
						optional: true
					}
				},
				{ id: 'name', match: 'option', flag: '--name', default: 'stolen_emoji' }
			],
			slash: false,
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES', 'MANAGE_EMOJIS_AND_STICKERS'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_EMOJIS_AND_STICKERS']
		});
	}
	public override async exec(message: BushMessage, args: { emoji?: URL | Emoji; name: string }): Promise<unknown> {
		if ((!args || !args.emoji) && !message.attachments.size)
			return await message.util.reply(`${util.emojis.error} You must provide an emoji to steal.`);
		const image =
			message.attachments.size && message.attachments.first()!.contentType?.includes('image/')
				? message.attachments.first()!.url
				: args?.emoji instanceof Emoji
				? `https://cdn.discordapp.com/emojis/${args.emoji.id}`
				: args?.emoji instanceof URL
				? args.emoji.href
				: undefined;

		if (!image) return await message.util.reply(`${util.emojis.error} You must provide an emoji to steal.`);

		const creationSuccess = await message
			.guild!.emojis.create(image, args.name, {
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
