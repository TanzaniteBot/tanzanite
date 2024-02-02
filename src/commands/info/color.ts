import { AllowedMentions, Arg, BotCommand, emojis, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import canvas from '@napi-rs/canvas';
import { ApplicationCommandOptionType, EmbedBuilder, Role } from 'discord.js';
import assert from 'node:assert/strict';
import tinycolor from 'tinycolor2';
assert(tinycolor);

export default class ColorCommand extends BotCommand {
	public constructor() {
		super('color', {
			aliases: ['color'],
			category: 'info',
			description: 'Find the color of a hex code, user, or role.',
			usage: ['color <color|role|user>'],
			examples: ['color #0000FF'],
			args: [
				{
					id: 'color',
					description: 'The color string, role, or member to find the color of.',
					type: Arg.union('tinyColor', 'role', 'member'),
					readableType: 'color|role|member',
					match: 'restContent',
					prompt: 'What color code, role, or user would you like to find the color of?',
					retry: '{error} Choose a valid color, role, or member.',
					slashType: ApplicationCommandOptionType.String
				}
			],
			channel: 'guild',
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: [],
			slash: true
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { color: ArgType<'tinyColor' | 'role' | 'member'> }) {
		const _color = message.util.isSlashMessage(message)
			? await Arg.castUnion(['tinyColor', 'role', 'member'], this, message, args.color as string)
			: args.color;

		if (_color == null) {
			return message.util.reply(`${emojis.error} Invalid color provided.`);
		}

		const color =
			typeof _color === 'string'
				? tinycolor(_color)
				: _color instanceof Role
					? tinycolor(_color.hexColor)
					: tinycolor(_color.displayHexColor);

		if (_color instanceof Role && _color.hexColor === '#000000') {
			return await message.util.reply({
				content: `${emojis.error} <@&${_color.id}> does not have a color.`,
				allowedMentions: AllowedMentions.none()
			});
		}

		const embed = new EmbedBuilder()
			.addFields(
				{ name: '» Hexadecimal', value: color.toHexString() },
				{ name: '» Decimal', value: `${colorToDecimal(color)}` },
				{ name: '» HSL', value: color.toHslString() },
				{ name: '» RGB', value: color.toRgbString() }
			)
			.setColor(parseInt(color.toHex(), 16))
			.setThumbnail('attachment://color.png');

		return await message.util.reply({
			embeds: [embed],
			files: [{ attachment: this.drawColor(color.toHexString()), name: 'color.png' }]
		});
	}

	private drawColor(hex: string): Buffer {
		const square = canvas.createCanvas(400, 400),
			ctx = square.getContext('2d');

		ctx.fillStyle = hex;
		ctx.fillRect(0, 0, square.width, square.height);

		return square.toBuffer('image/png');
	}
}

export function colorToDecimal(color: tinycolor.Instance): number {
	return parseInt(color.toHex(), 16);
}
