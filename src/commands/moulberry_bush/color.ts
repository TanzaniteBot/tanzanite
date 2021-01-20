import { BotCommand } from '../../extensions/BotCommand';
import { Message, MessageEmbed } from 'discord.js'

export default class EightBallCommand extends BotCommand {
	public constructor() {
		super('color', {
			aliases: ['color'],
			category: 'moulberry bush',
			args: [
				{
					id: 'color',
					type: /^#?(?<code>[0-9A-F]{6})$/i,
					prompt: {
						start: 'What color value would you like to see the color of',
					},
				},
			],
			channel: 'guild',
		});
	}
	public exec(message: Message, { color: { match } }: { color: { match: RegExpMatchArray; matches: RegExpMatchArray[] } }): void {

		const colorembed = new MessageEmbed()
			.addField('Hex', match.groups.code, false)
			.addField('RGB', this.client.consts.hexToRgb(match.groups.code), false)
			.setColor(match.groups.code)

		message.channel.send(colorembed)
	}
}