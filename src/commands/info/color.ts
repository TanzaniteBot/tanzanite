import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { Constants } from 'discord-akairo';
import { ColorResolvable, MessageEmbed } from 'discord.js';

export default class ColorCommand extends BushCommand {
	public constructor() {
		super('color', {
			aliases: ['color'],
			category: 'info',
			description: {
				content: 'See what color a hex code is.',
				usage: 'color <color>',
				examples: ['color #0000FF']
			},
			args: [
				{
					id: 'color',
					type: /^#?(?<code>[0-9A-F]{6})$/i,
					match: Constants.ArgumentMatches.PHRASE,
					prompt: {
						start: 'What color value would you like to see the color of',
						retry: '{error} Choose a valid hex color code.'
					}
				}
			],
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES']
		});
	}

	public async exec(
		message: BushMessage | BushSlashMessage,
		{ color: { match } }: { color: { match: RegExpMatchArray; matches: RegExpMatchArray[] } }
	): Promise<unknown> {
		const embed = new MessageEmbed()
			.addField('Hex', match.groups.code, false)
			.addField('RGB', this.client.util.hexToRgb(match.groups.code), false)
			.setColor(match.groups.code as ColorResolvable);

		return await message.util.reply({ embeds: [embed] });
	}
}
