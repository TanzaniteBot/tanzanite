import { AllowedMentions, BushCommand, BushGuildMember, BushMessage, BushRole, BushSlashMessage } from '@lib';
import { Argument } from 'discord-akairo';
import { Message, MessageEmbed, Role } from 'discord.js';
import tinycolor from 'tinycolor2'; // this is the only way I got it to work consistently

const isValidTinyColor = (_message: Message, phase: string) => {
	// if the phase is a number it converts it to hex incase it could be representing a color in decimal
	const newPhase = isNaN(phase as any) ? phase : `#${Number(phase).toString(16)}`;
	return tinycolor(newPhase).isValid() ? newPhase : null;
};

export default class ColorCommand extends BushCommand {
	public constructor() {
		super('color', {
			aliases: ['color'],
			category: 'info',
			description: {
				content: 'Find the color of a hex code, user, or role.',
				usage: ['color <color|role|user>'],
				examples: ['color #0000FF']
			},
			args: [
				{
					id: 'color',
					customType: Argument.union(isValidTinyColor, 'role', 'member'),
					match: 'restContent',
					prompt: {
						start: 'What color code, role, or user would you like to find the color of?',
						retry: '{error} Choose a valid color, role, or member.'
					}
				}
			],
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['EMBED_LINKS'], true),
			userPermissions: []
		});
	}

	public removePrefixAndParenthesis(color: string): string {
		return color.substr(4, color.length - 5);
	}

	public override async exec(message: BushMessage | BushSlashMessage, args: { color: string | BushRole | BushGuildMember }) {
		const color =
			typeof args.color === 'string'
				? tinycolor(args.color)
				: args.color instanceof Role
				? tinycolor(args.color.hexColor)
				: tinycolor(args.color.displayHexColor);

		if (args.color instanceof Role && args.color.hexColor === '#000000') {
			return await message.util.reply({
				content: `${util.emojis.error} <@&${args.color.id}> does not have a color.`,
				allowedMentions: AllowedMentions.none()
			});
		}

		const embed = new MessageEmbed()
			.addField('» Hexadecimal', color.toHexString())
			.addField('» Decimal', `${parseInt(color.toHex(), 16)}`)
			.addField('» HSL', this.removePrefixAndParenthesis(color.toHslString()))
			.addField('» RGB', this.removePrefixAndParenthesis(color.toRgbString()))
			.setColor(color.toHex() as `#${string}`);

		return await message.util.reply({ embeds: [embed] });
	}
}
