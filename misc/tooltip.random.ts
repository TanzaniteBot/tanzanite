import { formattingInfo } from './formattingInfo.js';

function drawGradientRect(
	zLevel: number,
	left: number,
	top: number,
	right: number,
	bottom: number,
	startColor: number,
	endColor: number
) {
	const startAlpha = ((startColor >> 24) & 255) / 255.0;
	const startRed = ((startColor >> 16) & 255) / 255.0;
	const startGreen = ((startColor >> 8) & 255) / 255.0;
	const startBlue = (startColor & 255) / 255.0;
	const endAlpha = ((endColor >> 24) & 255) / 255.0;
	const endRed = ((endColor >> 16) & 255) / 255.0;
	const endGreen = ((endColor >> 8) & 255) / 255.0;
	const endBlue = (endColor & 255) / 255.0;

	// console.dir({ startAlpha, startRed, startGreen, startBlue, endAlpha, endRed, endGreen, endBlue });
	// console.dir({
	// 	startAlpha: color(startAlpha),
	// 	startRed: color(startRed),
	// 	startGreen: color(startGreen),
	// 	startBlue: color(startBlue),
	// 	endAlpha: color(endAlpha),
	// 	endRed: color(endRed),
	// 	endGreen: color(endGreen),
	// 	endBlue: color(endBlue)
	// });
}

function color(num: number) {
	return Math.floor(num * 255);
}

// const zLevel = 300;
// const backgroundColor = 0xf0100010;
// drawGradientRect(zLevel, 0, 0, 0, 0, backgroundColor, backgroundColor);

// ctx.fillText(stripCodes(item.displayname), scale * 4, scale * 11);
// ctx.measureText;

// const parts = item.displayname.split(/(?=§[0-9a-f])/).filter((part) => part.length > 1);
// console.dir(parts);

// for (let i = 0; i < parts.length; i++) {
// 	const part = parts[i];

// 	const color = `${part.substring(0, 2)}` as `${Color}`;
// 	console.dir(color);

// 	const str = part.substring(2);

// 	for (let j = 0; j < str.length; j++) {
// 		const c = str[j];

// 		x += drawCharacter(color, c, x, y);
// 	}
// }

// for (let i = 0; i < item.lore.length; i++) {
// 	const line = item.lore[i];

// 	const parts = line.split(/(?=§[0-9a-f])/).filter((part) => part.length > 1);

// 	let x = scale * 4;

// 	for (let i = 0; i < parts.length; i++) {
// 		const part = parts[i];

// 		const color = `${part.substring(0, 2)}` as `${Color}`;
// 		console.dir(color);

// 		const str = part.substring(2);

// 		for (let j = 0; j < str.length; j++) {
// 			const c = str[j];

// 			x += drawCharacter(color, c, x, y);
// 		}
// 	}

// 	y += scale * 11;
// }

function stripCodes(str: string) {
	for (const format in formattingInfo) {
		str = str.replaceAll(format, '');
	}
	return str;
}

// for (let i = 0; i < 1000; i++) {
// 	const randomItem = items[Math.floor(Math.random() * items.length)];
// 	const item = (await import(path.join(itemPath, randomItem), { assert: { type: 'json' } })).default as RawNeuItem;

// 	console.log(stripCodes(item.displayname));
// 	tooltip(item);

// 	await fs.writeFile(path.join(__dirname, 'test.png'), tooltip(item));

// 	await promisify(setTimeout)(50);
// }
