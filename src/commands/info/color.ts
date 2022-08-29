import {
	AllowedMentions,
	Arg,
	BotCommand,
	clientSendAndPermCheck,
	emojis,
	type ArgType,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import assert from 'assert/strict';
import { ApplicationCommandOptionType, EmbedBuilder, GuildMember, PermissionFlagsBits, Role } from 'discord.js';
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
			clientPermissions: (m) => clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: []
		});
	}

	public removePrefixAndParenthesis(color: string): string {
		return color.substring(4, color.length - 5);
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { color: ArgType<'tinyColor' | 'role' | 'member'> }) {
		const _color = message.util.isSlashMessage(message)
			? ((await Arg.cast(Arg.union('tinyColor', 'role', 'member'), message, args.color as string)) as string | Role | GuildMember)
			: args.color;

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
				{ name: '» Decimal', value: `${parseInt(color.toHex(), 16)}` },
				{ name: '» HSL', value: this.removePrefixAndParenthesis(color.toHslString()) },
				{ name: '» RGB', value: this.removePrefixAndParenthesis(color.toRgbString()) }
			)
			.setColor(parseInt(color.toHex(), 16));

		return await message.util.reply({ embeds: [embed] });
	}
}
