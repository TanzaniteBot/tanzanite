import {
	AllowedMentions,
	BushCommand,
	type ArgType,
	type BushArgumentTypeCaster,
	type BushGuildMember,
	type BushMessage,
	type BushRole,
	type BushSlashMessage
} from '#lib';
import assert from 'assert';
import { MessageEmbed, Role } from 'discord.js';
import tinycolor from 'tinycolor2';
assert(tinycolor);

const isValidTinyColor: BushArgumentTypeCaster<string | null> = (_message, phase) => {
	// if the phase is a number it converts it to hex incase it could be representing a color in decimal
	const newPhase = isNaN(phase as any) ? phase : `#${Number(phase).toString(16)}`;
	return tinycolor(newPhase).isValid() ? newPhase : null;
};

export default class ColorCommand extends BushCommand {
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
					type: util.arg.union(isValidTinyColor as any, 'role', 'member'),
					readableType: 'color|role|member',
					match: 'restContent',
					prompt: 'What color code, role, or user would you like to find the color of?',
					retry: '{error} Choose a valid color, role, or member.',
					slashType: 'STRING'
				}
			],
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['EMBED_LINKS'], true),
			userPermissions: []
		});
	}

	public removePrefixAndParenthesis(color: string): string {
		return color.substring(4, color.length - 5);
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { color: string | ArgType<'role'> | ArgType<'member'> }
	) {
		const _color = message.util.isSlashMessage(message)
			? ((await util.arg.cast(util.arg.union(isValidTinyColor, 'role', 'member'), message, args.color as string)) as
					| string
					| BushRole
					| BushGuildMember)
			: args.color;

		const color =
			typeof _color === 'string'
				? tinycolor(_color)
				: _color instanceof Role
				? tinycolor(_color.hexColor)
				: tinycolor(_color.displayHexColor);

		if (_color instanceof Role && _color.hexColor === '#000000') {
			return await message.util.reply({
				content: `${util.emojis.error} <@&${_color.id}> does not have a color.`,
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
