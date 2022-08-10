import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { mcToAnsi, RawNeuItem } from './Minecraft.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repo = path.join(__dirname, '..', '..', '..', '..', '..', 'neu-item-repo-dangerous');
const itemPath = path.join(repo, 'items');
const items = await fs.readdir(itemPath);

// for (let i = 0; i < 5; i++) {
for (const path_ of items) {
	// const randomItem = items[Math.floor(Math.random() * items.length)];
	// console.log(randomItem);
	const item = (await import(path.join(itemPath, /* randomItem */ path_), { assert: { type: 'json' } })).default as RawNeuItem;
	if (/.*?((_MONSTER)|(_NPC)|(_ANIMAL)|(_MINIBOSS)|(_BOSS)|(_SC))$/.test(item.internalname)) continue;
	if (!/.*?;[0-5]$/.test(item.internalname)) continue;
	/* console.log(path_);
	 console.dir(item, { depth: Infinity }); */

	/* console.log('==========='); */
	// const nbt = parse(item.nbttag) as NbtTag;

	// if (nbt?.SkullOwner?.Properties?.textures?.[0]?.Value) {
	// 	nbt.SkullOwner.Properties.textures[0].Value = parse(
	// 		Buffer.from(nbt.SkullOwner.Properties.textures[0].Value, 'base64').toString('utf-8')
	// 	) as string;
	// }

	// if (nbt.ExtraAttributes?.petInfo) {
	// 	nbt.ExtraAttributes.petInfo = JSON.parse(nbt.ExtraAttributes.petInfo as any as string);
	// }

	// delete nbt.display?.Lore;

	// console.dir(nbt, { depth: Infinity });
	// console.log('===========');

	/* if (nbt?.display && nbt.display.Name !== item.displayname)
		console.log(`${path_}		display name mismatch: ${mcToAnsi(nbt.display.Name)} != ${mcToAnsi(item.displayname)}`);

	if (nbt?.ExtraAttributes && nbt?.ExtraAttributes.id !== item.internalname)
		console.log(`${path_}		internal name mismatch: ${mcToAnsi(nbt?.ExtraAttributes.id)} != ${mcToAnsi(item.internalname)}`); */

	//  console.log('===========');

	console.log(mcToAnsi(item.displayname));
	console.log(item.lore.map((l) => mcToAnsi(l)).join('\n'));

	/* const keys = [
		'itemid',
		'displayname',
		'nbttag',
		'damage',
		'lore',
		'recipe',
		'internalname',
		'modver',
		'infoType',
		'info',
		'crafttext',
		'vanilla',
		'useneucraft',
		'slayer_req',
		'clickcommand',
		'x',
		'y',
		'z',
		'island',
		'recipes',
		'parent',
		'noseal'
	];

	Object.keys(item).forEach((k) => {
		if (!keys.includes(k)) throw new Error(`Unknown key: ${k}`);
	});

	if (
		'slayer_req' in item &&
		!new Array(10).flatMap((_, i) => ['WOLF', 'BLAZE', 'EMAN'].map((e) => e + (i + 1)).includes(item.slayer_req!))
	)
		throw new Error(`Unknown slayer req: ${item.slayer_req!}`); */

	/* console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n=-=-=-=-=-=-=-=-=-=-=-=-=-=-'); */
}
