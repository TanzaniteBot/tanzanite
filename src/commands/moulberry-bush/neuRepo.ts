import { BushCommand, clientSendAndPermCheck, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import canvas from 'canvas';
import {
	ApplicationCommandOptionType,
	AttachmentBuilder,
	AutocompleteInteraction,
	CacheType,
	PermissionFlagsBits
} from 'discord.js';
import { dirname, join } from 'path';
import tinycolor from 'tinycolor2';
import { fileURLToPath } from 'url';
import { formattingInfo, RawNeuItem } from '../../lib/common/util/Minecraft.js';

export default class NeuRepoCommand extends BushCommand {
	public static items: { name: string; id: string }[] = [];

	public constructor() {
		super('neuRepo', {
			aliases: ['neu-repo', 'repo-item', 'neu-item', 'item-repo'],
			category: "Moulberry's Bush",
			description: 'Get information about an item from the NEU item repo.',
			usage: ['neu-repo <item>'],
			examples: ['neu-repo BARRIER'],
			args: [
				{
					id: 'item',
					description: 'The item id that you would like to find neu item information about.',
					type: 'string',
					prompt: 'What SkyBlock item would you like to get information about?',
					retry: '{error} Pick a valid SkyBlock item ID. Try using the slash command for a better experience.',
					slashType: ApplicationCommandOptionType.String,
					autocomplete: true
				}
				/* {
					id: 'dangerous',
					description: 'Whether or not to use the dangerous branch.',
					prompt: 'Would you like to use the dangerous branch instead of the master branch?',
					match: 'flag',
					flag: ['--dangerous', '-d'],
					default: false,
					optional: true,
					slashType: ApplicationCommandOptionType.Boolean
				} */
			],
			slash: true,
			clientPermissions: (m) => clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: [],
			ownerOnly: true
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { item: ArgType<'string'> /* dangerous: ArgType<'flag'> */ }
	) {
		const itemPath = join(import.meta.url, '..', '..', '..', '..', '..', 'neu-item-repo-dangerous', 'items', `${args.item}.json`);
		const item = (await import(itemPath, { assert: { type: 'json' } })).default as RawNeuItem;

		const toolTip = this.toolTip(item);

		return message.util.reply({
			files: [new AttachmentBuilder(toolTip, { name: `${item.internalname}.png`, description: item.displayname })]
		});
	}

	public toolTip(item: RawNeuItem): Buffer {
		canvas.registerFont(join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', 'assets', 'Faithful.ttf'), {
			family: 'Faithful'
		});

		const background = '#100010';

		const width = 250;
		const height = 250;
		const scale = 10;

		const itemRender = canvas.createCanvas(width, height),
			ctx = itemRender.getContext('2d');

		ctx.globalAlpha = 0.94;
		ctx.fillStyle = background;

		// top outside
		ctx.fillRect(scale, 0, width - 2 * scale, scale);

		// bottom outside
		ctx.fillRect(scale, height - scale, width - 2 * scale, scale);

		// left outside
		ctx.fillRect(0, scale, scale, height - 2 * scale);

		// right outside
		ctx.fillRect(width - scale, scale, scale, height - 2 * scale);

		// middle
		ctx.fillRect(2 * scale, 2 * scale, width - 4 * scale, height - 4 * scale);

		ctx.globalAlpha = 0.78;

		const borderColorStart = parseInt(new tinycolor(this.getPrimaryColour(item.displayname)).toHex(), 16);
		const borderColorEnd = ((borderColorStart & 0xfefefe) >> 1) | (borderColorStart & 0xff000000);

		const borderColorStartStr = `#${borderColorStart.toString(16)}`;
		const borderColorEndStr = `#${borderColorEnd.toString(16)}`;

		ctx.fillStyle = borderColorStartStr;

		// top highlight
		ctx.fillRect(scale, scale, width - 2 * scale, scale);

		// left highlight
		ctx.fillRect(scale, 2 * scale, scale, height - 3 * scale);

		// bottom highlight
		{
			const x = 2 * scale,
				y = height - 2 * scale,
				w = width - 3 * scale,
				h = scale;
			const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
			gradient.addColorStop(0, borderColorStartStr);
			gradient.addColorStop(1, borderColorEndStr);
			ctx.fillStyle = gradient;

			ctx.fillRect(x, y, w, h);
		}

		// right highlight
		{
			const x = width - 2 * scale,
				y = 2 * scale,
				w = scale,
				h = height - 4 * scale;
			const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
			gradient.addColorStop(0, borderColorStartStr);
			gradient.addColorStop(1, borderColorEndStr);
			ctx.fillStyle = gradient;

			ctx.fillRect(x, y, w, h);
		}

		item.displayname.split('');

		return itemRender.toBuffer();
	}

	// stolen from NEU and modified
	public getPrimaryColourCode(displayname: string): code {
		let lastColourCode = -99;
		let currentColour = 0;
		const mostCommon = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		for (let i = 0; i < displayname.length; i++) {
			const c = displayname.charAt(i);
			if (c === '\u00A7') {
				lastColourCode = i;
			} else if (lastColourCode === i - 1) {
				const colIndex = '0123456789abcdef'.indexOf(c);
				if (colIndex >= 0) {
					currentColour = colIndex;
				} else {
					currentColour = 0;
				}
			} else if ('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(c) >= 0) {
				if (currentColour > 0) {
					mostCommon[currentColour] = mostCommon[currentColour]++;
				}
			}
		}
		let mostCommonCount = 0;
		for (let index = 0; index < mostCommon.length; index++) {
			if (mostCommon[index] > mostCommonCount) {
				mostCommonCount = mostCommon[index];
				currentColour = index;
			}
		}

		return <code>'0123456789abcdef'.charAt(currentColour);
	}

	// stolen from NEU and modified
	public getPrimaryColour(displayname: string) {
		const code = this.getPrimaryColourCode(displayname);
		return formattingInfo[`§${code}`].foregroundDarker;
	}

	public override async autocomplete(interaction: AutocompleteInteraction<CacheType>) {
		return interaction.respond([{ name: 'Blazetekk™ Ham Radio', value: 'BLAZETEKK_HAM_RADIO' }]);
	}
}

type code = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
