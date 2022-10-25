/// <reference lib="dom" />

process.removeAllListeners('warning');

import canvas, { GlobalFonts } from '@napi-rs/canvas';
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import { promisify } from 'node:util';
import tinycolor from 'tinycolor2';
import { Color, ColorCode, FormattingCodes, formattingInfo, RawNeuItem } from './formattingInfo.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

GlobalFonts.loadFontsFromDir(path.join(__dirname, '../assets/fonts'));

const colorRegex = /(?=§[0-9a-fklmnor])/;

// the characters that the minecraft font supports
const supportedChars = /(?=[\u0020-\u007e\u00a1\u00a5\u00a8\u00bf\u00d8\u00e5\u00e6\u00f8\u2018\u2019\u201c\u201d])/;

const repo = path.join(__dirname, '../neu-item-repo');
const itemPath = path.join(repo, 'items');
const items = (await fs.readdir(itemPath)).filter((f) => !f.endsWith('NPC.json') && !f.endsWith('MONSTER.json'));

const id = process.argv[2];

if (id) {
	const item = (await import(path.join(itemPath, `${id}.json`), { assert: { type: 'json' } })).default as RawNeuItem;

	await fs.writeFile(path.join(__dirname, 'test.png'), tooltip(item));
} else {
	for (const dir of items) {
		const item = (await import(path.join(itemPath, dir), { assert: { type: 'json' } })).default as RawNeuItem;

		console.time(item.internalname);
		const tooltipImg = tooltip(item);
		console.timeEnd(item.internalname);

		await fs.writeFile(path.join(__dirname, 'test.png'), tooltipImg);

		await promisify(setTimeout)(100);
	}
}

// stolen from NEU
function getPrimaryColorCode(displayname: string): ColorCode {
	let lastColorCode = -99;
	let currentColor = 0;
	const mostCommon = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	for (let i = 0; i < displayname.length; i++) {
		const c = displayname.charAt(i);
		if (c === '\u00A7') {
			lastColorCode = i;
		} else if (lastColorCode === i - 1) {
			const colIndex = '0123456789abcdef'.indexOf(c);
			if (colIndex >= 0) {
				currentColor = colIndex;
			} else {
				currentColor = 0;
			}
		} else if ('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(c) >= 0) {
			if (currentColor > 0) {
				mostCommon[currentColor] = mostCommon[currentColor]++;
			}
		}
	}
	let mostCommonCount = 0;
	for (let index = 0; index < mostCommon.length; index++) {
		if (mostCommon[index] > mostCommonCount) {
			mostCommonCount = mostCommon[index];
			currentColor = index;
		}
	}

	return <ColorCode>'0123456789abcdef'.charAt(currentColor);
}

function getPrimaryColor(displayname: string) {
	const code = getPrimaryColorCode(displayname);
	return formattingInfo[`§${code}`].foregroundDarker;
}

function tooltip(item: RawNeuItem) {
	console.log(item.internalname);

	const background = '#100010';

	const scale = 4;
	const width = getMaxLineWidth(item, scale) + scale * 4 + scale * 4;
	const height = scale * 3 + scale * 10 + scale * 3 + item.lore.length * scale * 10 + scale * 2;

	const itemRender = canvas.createCanvas(width, height),
		ctx = itemRender.getContext('2d');

	ctx.globalAlpha = 1.0;
	//~ ctx.globalAlpha = 0.94;
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

	//~ ctx.globalAlpha = 0.78;
	ctx.globalAlpha = 1.0;

	const borderColorStart = parseInt(new tinycolor(getPrimaryColor(item.displayname)).toHex(), 16);
	const borderColorEnd = ((borderColorStart & 0xfefefe) >> 1) | (borderColorStart & 0xff000000);

	const borderColorStartStr = `#${decimalToHex(borderColorStart)}`;
	const borderColorEndStr = `#${decimalToHex(borderColorEnd)}`;

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

	let y = scale * 11;

	let maxLineWidth = 0;

	y += drawLine(item.displayname, y);

	y += scale * 2;

	for (const line of item.lore) {
		y += drawLine(line, y);
	}

	const buf = itemRender.toBuffer('image/png');
	return buf;

	function drawLine(line: string, y: number): number {
		const formatting = getDefaultFormatting();

		const parts = line.split(colorRegex);

		let x = scale * 4;

		for (const part of parts) {
			const first = part.substring(0, 2);

			let str: string;
			if (colorRegex.test(first)) {
				str = part.substring(2);

				parseFormat(formatting, first as FormattingCodes);
			} else {
				str = part;
			}

			for (const char of str) {
				x += drawChar(formatting, char, x, y);
			}
		}

		if (x > maxLineWidth) maxLineWidth = x;

		return scale * 10;
	}

	function drawChar(formatting: Formatting, character: string, x: number, y: number): number {
		const supported = supportedChars.test(character);

		ctx.font = getFont(formatting, scale, !supported);

		ctx.fillStyle = formattingInfo[formatting.color].background;
		ctx.fillText(character, x + scale, y + scale);

		ctx.fillStyle = formattingInfo[formatting.color].foreground;
		ctx.fillText(character, x, y);

		return ctx.measureText(character).width;
	}
}

function getMaxLineWidth(item: RawNeuItem, scale: number): number {
	const itemRender = canvas.createCanvas(1000, 1000),
		ctx = itemRender.getContext('2d');

	let maxLineWidth = 0;

	measureLine(item.displayname);
	for (const line of item.lore) {
		measureLine(line);
	}

	return maxLineWidth;

	function measureLine(line: string) {
		const formatting = getDefaultFormatting();

		const parts = line.split(colorRegex);

		let width = 0;

		for (const part of parts) {
			const first = part.substring(0, 2);

			let str: string;
			if (colorRegex.test(first)) {
				str = part.substring(2);

				parseFormat(formatting, first as FormattingCodes);
			} else {
				str = part;
			}

			for (const char of str) {
				width += measureChar(formatting, char);
			}
		}

		if (width > maxLineWidth) maxLineWidth = width;
	}

	function measureChar(formatting: Formatting, character: string): number {
		const supported = supportedChars.test(character);

		ctx.font = getFont(formatting, scale, !supported);

		const metrics = ctx.measureText(character);

		return metrics.width;
	}
}

function decimalToHex(decimal: number) {
	return decimal.toString(16).padStart(6, '0');
}

function getFont(formatting: Formatting, scale: number, unicode: boolean): string {
	let font = '';
	if (formatting.bold) font += 'bold ';
	if (formatting.italic) font += 'italic ';
	// canvas does not native support underline or strikethrough

	// minecraft uses a scaled down version of Unifont for unsupported unicode characters
	font += `${scale * (unicode ? 8 : 10)}px ${unicode ? 'Unifont' : 'Minecraft'}`;
	return font;
}

function getDefaultFormatting(): Formatting {
	return {
		color: FormattingCodes.White,
		obfuscated: false,
		bold: false,
		strikethrough: false,
		underline: false,
		italic: false
	};
}

function parseFormat(formatting: Formatting, code: FormattingCodes) {
	switch (code) {
		case FormattingCodes.Black:
		case FormattingCodes.DarkBlue:
		case FormattingCodes.DarkGreen:
		case FormattingCodes.DarkAqua:
		case FormattingCodes.DarkRed:
		case FormattingCodes.DarkPurple:
		case FormattingCodes.Gold:
		case FormattingCodes.Gray:
		case FormattingCodes.DarkGray:
		case FormattingCodes.Blue:
		case FormattingCodes.Green:
		case FormattingCodes.Aqua:
		case FormattingCodes.Red:
		case FormattingCodes.LightPurple:
		case FormattingCodes.Yellow:
		case FormattingCodes.White:
			formatting.color = code as Color;
			break;

		case FormattingCodes.Obfuscated:
			formatting.obfuscated = true;
			break;

		case FormattingCodes.Bold:
			formatting.bold = true;
			break;

		case FormattingCodes.Strikethrough:
			formatting.strikethrough = true;
			break;

		case FormattingCodes.Underline:
			formatting.underline = true;
			break;

		case FormattingCodes.Italic:
			formatting.underline = true;
			break;

		case FormattingCodes.Reset:
			formatting.bold = false;
			formatting.italic = false;
			formatting.underline = false;
			formatting.strikethrough = false;
			formatting.obfuscated = false;
			formatting.color = FormattingCodes.White;
			break;
	}
}

interface Formatting {
	color: Color;
	obfuscated: boolean;
	bold: boolean;
	strikethrough: boolean;
	underline: boolean;
	italic: boolean;
}
