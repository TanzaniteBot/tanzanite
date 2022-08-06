/* eslint-disable */
// @ts-check

import { createCanvas, registerFont } from 'canvas';
import fs from 'fs/promises';
import path, { dirname, join } from 'path';
import tinycolor from 'tinycolor2';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
registerFont(join(__dirname, 'assets', 'Faithful.ttf'), { family: 'ComplianceSans' });
registerFont(join(dirname(fileURLToPath(import.meta.url)), 'assets', 'Roboto-Regular.ttf'), { family: 'Roboto' });

/** @typedef {string} McItemId */
/** @typedef {string} SbItemId */
/** @typedef {string} MojangJson */
/** @typedef {`${SbItemId}:${number}` | ''} SbRecipeItem */
/** @typedef {{[Location in `${'A' | 'B' | 'C'}${1 | 2 | 3}`]: SbRecipeItem;}} SbRecipe */
/** @typedef {'WIKI_URL' | ''} InfoType */
/** @typedef {`${'WOLF' | 'BLAZE' | 'EMAN'}_${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`} Slayer */
/** @typedef {'0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'a'|'b'|'c'|'d'|'e'|'f'} code */
/**
 * @typedef RawNeuItem
 * @property {McItemId} itemid
 * @property {string} displayname
 * @property {MojangJson} nbttag
 * @property {number} damage
 * @property {string[]} lore
 * @property {SbRecipe} [recipe]
 * @property {SbItemId} internalname
 * @property {InfoType} infoType
 * @property {string[]} [info]
 * @property {string} crafttext
 * @property {boolean} [vanilla]
 * @property {boolean} [useneucraft]
 * @property {Slayer} [slayer_req]
 * @property {string} [clickcommand]
 * @property {number} [x]
 * @property {number} [y]
 * @property {number} [z]
 * @property {string} [island]
 * @property {{ type: string; cost: any[]; result: SbItemId }[]} [recipes]
 * @property {SbItemId} [parent]
 * @property {boolean} [noseal]
 */

const FormattingCodes = {
	Black: '§0',
	DarkBlue: '§1',
	DarkGreen: '§2',
	DarkAqua: '§3',
	DarkRed: '§4',
	DarkPurple: '§5',
	Gold: '§6',
	Gray: '§7',
	DarkGray: '§8',
	Blue: '§9',
	Green: '§a',
	Aqua: '§b',
	Red: '§c',
	LightPurple: '§d',
	Yellow: '§e',
	White: '§f',

	Obfuscated: '§k',
	Bold: '§l',
	Strikethrough: '§m',
	Underline: '§n',
	Italic: '§o',
	Reset: '§r'
};

const formattingInfo = {
	[FormattingCodes.Black]: {
		foreground: 'rgb(0, 0, 0)',
		foregroundDarker: 'rgb(0, 0, 0)',
		background: 'rgb(0, 0, 0)',
		backgroundDarker: 'rgb(0, 0, 0)',
		ansi: '\u001b[0;30m'
	},
	[FormattingCodes.DarkBlue]: {
		foreground: 'rgb(0, 0, 170)',
		foregroundDarker: 'rgb(0, 0, 118)',
		background: 'rgb(0, 0, 42)',
		backgroundDarker: 'rgb(0, 0, 29)',
		ansi: '\u001b[0;34m'
	},
	[FormattingCodes.DarkGreen]: {
		foreground: 'rgb(0, 170, 0)',
		foregroundDarker: 'rgb(0, 118, 0)',
		background: 'rgb(0, 42, 0)',
		backgroundDarker: 'rgb(0, 29, 0)',
		ansi: '\u001b[0;32m'
	},
	[FormattingCodes.DarkAqua]: {
		foreground: 'rgb(0, 170, 170)',
		foregroundDarker: 'rgb(0, 118, 118)',
		background: 'rgb(0, 42, 42)',
		backgroundDarker: 'rgb(0, 29, 29)',
		ansi: '\u001b[0;36m'
	},
	[FormattingCodes.DarkRed]: {
		foreground: 'rgb(170, 0, 0)',
		foregroundDarker: 'rgb(118, 0, 0)',
		background: 'rgb(42, 0, 0)',
		backgroundDarker: 'rgb(29, 0, 0)',
		ansi: '\u001b[0;31m'
	},
	[FormattingCodes.DarkPurple]: {
		foreground: 'rgb(170, 0, 170)',
		foregroundDarker: 'rgb(118, 0, 118)',
		background: 'rgb(42, 0, 42)',
		backgroundDarker: 'rgb(29, 0, 29)',
		ansi: '\u001b[0;35m'
	},
	[FormattingCodes.Gold]: {
		foreground: 'rgb(255, 170, 0)',
		foregroundDarker: 'rgb(178, 118, 0)',
		background: 'rgb(42, 42, 0)',
		backgroundDarker: 'rgb(29, 29, 0)',
		ansi: '\u001b[0;33m'
	},
	[FormattingCodes.Gray]: {
		foreground: 'rgb(170, 170, 170)',
		foregroundDarker: 'rgb(118, 118, 118)',
		background: 'rgb(42, 42, 42)',
		backgroundDarker: 'rgb(29, 29, 29)',
		ansi: '\u001b[0;37m'
	},
	[FormattingCodes.DarkGray]: {
		foreground: 'rgb(85, 85, 85)',
		foregroundDarker: 'rgb(59, 59, 59)',
		background: 'rgb(21, 21, 21)',
		backgroundDarker: 'rgb(14, 14, 14)',
		ansi: '\u001b[0;90m'
	},
	[FormattingCodes.Blue]: {
		foreground: 'rgb(85, 85, 255)',
		foregroundDarker: 'rgb(59, 59, 178)',
		background: 'rgb(21, 21, 63)',
		backgroundDarker: 'rgb(14, 14, 44)',
		ansi: '\u001b[0;94m'
	},
	[FormattingCodes.Green]: {
		foreground: 'rgb(85, 255, 85)',
		foregroundDarker: 'rgb(59, 178, 59)',
		background: 'rgb(21, 63, 21)',
		backgroundDarker: 'rgb(14, 44, 14)',
		ansi: '\u001b[0;92m'
	},
	[FormattingCodes.Aqua]: {
		foreground: 'rgb(85, 255, 255)',
		foregroundDarker: 'rgb(59, 178, 178)',
		background: 'rgb(21, 63, 63)',
		backgroundDarker: 'rgb(14, 44, 44)',
		ansi: '\u001b[0;96m'
	},
	[FormattingCodes.Red]: {
		foreground: 'rgb(255, 85, 85)',
		foregroundDarker: 'rgb(178, 59, 59)',
		background: 'rgb(63, 21, 21)',
		backgroundDarker: 'rgb(44, 14, 14)',
		ansi: '\u001b[0;91m'
	},
	[FormattingCodes.LightPurple]: {
		foreground: 'rgb(255, 85, 255)',
		foregroundDarker: 'rgb(178, 59, 178)',
		background: 'rgb(63, 21, 63)',
		backgroundDarker: 'rgb(44, 14, 44)',
		ansi: '\u001b[0;95m'
	},
	[FormattingCodes.Yellow]: {
		foreground: 'rgb(255, 255, 85)',
		foregroundDarker: 'rgb(178, 178, 59)',
		background: 'rgb(63, 63, 21)',
		backgroundDarker: 'rgb(44, 44, 14)',
		ansi: '\u001b[0;93m'
	},
	[FormattingCodes.White]: {
		foreground: 'rgb(255, 255, 255)',
		foregroundDarker: 'rgb(178, 178, 178)',
		background: 'rgb(63, 63, 63)',
		backgroundDarker: 'rgb(44, 44, 44)',
		ansi: '\u001b[0;97m'
	},

	[FormattingCodes.Obfuscated]: { ansi: '\u001b[8m' },
	[FormattingCodes.Bold]: { ansi: '\u001b[1m' },
	[FormattingCodes.Strikethrough]: { ansi: '\u001b[9m' },
	[FormattingCodes.Underline]: { ansi: '\u001b[4m' },
	[FormattingCodes.Italic]: { ansi: '\u001b[3m' },
	[FormattingCodes.Reset]: { ansi: '\u001b[0m' }
};

/**
 * stolen from NEU
 * @param {string} displayname
 * @returns {code}
 */
function getPrimaryColourCode(displayname) {
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

	/** @type {code} */
	// @ts-ignore
	const code = '0123456789abcdef'.charAt(currentColour);
	return code;
}

/**
 * @param {number} decimal
 */
function decimalToHex(decimal) {
	return decimal.toString(16).padStart(6, '0');
}

/**
 * @param {RawNeuItem} item
 * @returns {Buffer}
 */
function tooltip(item) {
	const background = '#100010';

	const width = 1920;
	const height = 1080;
	const scale = 10;

	const itemRender = createCanvas(width, height),
		ctx = itemRender.getContext('2d');

	// ctx.fillStyle = '#000';
	// ctx.fillRect(0, 0, width, height);

	// ctx.globalAlpha = 0.94;
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

	// ctx.globalAlpha = 0.78;

	const borderColorStart = parseInt(new tinycolor(getPrimaryColour(item.displayname)).toHex(), 16);
	const borderColorEnd = ((borderColorStart & 0xfefefe) >> 1) | (borderColorStart & 0xff000000);

	const borderColorStartStr = `#${decimalToHex(borderColorStart)}`;
	const borderColorEndStr = `#${decimalToHex(borderColorEnd)}`;

	console.log(borderColorStartStr, borderColorEndStr);

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

	ctx.font = `50px ComplianceSans`;
	ctx.fillText(stripCodes(item.displayname), scale * 4, scale * 7);

	for (let i = 0; i < item.lore.length; i++) {
		const line = item.lore[i];

		ctx.fillStyle = `#${decimalToHex(parseInt(new tinycolor(getPrimaryColour(line)).toHex(), 16))}`;
		ctx.fillText(stripCodes(line), scale * 4, scale * (7 + (i + 1) * 5));
	}

	return itemRender.toBuffer('image/png');
}

/**
 * @param {string} displayname
 */
function getPrimaryColour(displayname) {
	const code = getPrimaryColourCode(displayname);
	return formattingInfo[`§${code}`].foregroundDarker;
}

/**
 * @param {string} str
 * @returns {string}
 */
function stripCodes(str) {
	for (const format in formattingInfo) {
		// @ts-ignore
		str = str.replaceAll(new RegExp(format, 'ig'), '');
	}
	return str;
}

const repo = path.join(__dirname, 'neu-item-repo-dangerous');
const itemPath = path.join(repo, 'items');
const items = await fs.readdir(itemPath);

const randomItem = items[Math.floor(Math.random() * items.length)];
/** @type {RawNeuItem} */
const item = (await import(path.join(itemPath, randomItem), { assert: { type: 'json' } })).default;

console.log(randomItem);
fs.writeFile('./test.png', tooltip(item));
