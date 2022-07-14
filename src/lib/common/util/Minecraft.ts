import { Byte, Int, parse } from '@ironm00n/nbt-ts';
import { BitField } from 'discord.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export enum FormattingCodes {
	Black = '§0',
	DarkBlue = '§1',
	DarkGreen = '§2',
	DarkAqua = '§3',
	DarkRed = '§4',
	DarkPurple = '§5',
	Gold = '§6',
	Gray = '§7',
	DarkGray = '§8',
	Blue = '§9',
	Green = '§a',
	Aqua = '§b',
	Red = '§c',
	LightPurple = '§d',
	Yellow = '§e',
	White = '§f',

	Obfuscated = '§k',
	Bold = '§l',
	Strikethrough = '§m',
	Underline = '§n',
	Italic = '§o',
	Reset = '§r'
}

// https://minecraft.fandom.com/wiki/Formatting_codes
export const formattingInfo = {
	[FormattingCodes.Black]: { foreground: '#000000', background: '#000000', ansi: '\u001b[0;30m' },
	[FormattingCodes.DarkBlue]: { foreground: '#0000AA', background: '#00002A', ansi: '\u001b[0;34m' },
	[FormattingCodes.DarkGreen]: { foreground: '#00AA00', background: '#002A00', ansi: '\u001b[0;32m' },
	[FormattingCodes.DarkAqua]: { foreground: '#00AAAA', background: '#002A2A', ansi: '\u001b[0;36m' },
	[FormattingCodes.DarkRed]: { foreground: '#AA0000', background: '#2A0000', ansi: '\u001b[0;31m' },
	[FormattingCodes.DarkPurple]: { foreground: '#AA00AA', background: '#2A002A', ansi: '\u001b[0;35m' },
	[FormattingCodes.Gold]: { foreground: '#FFAA00', background: '#2A2A00', ansi: '\u001b[0;33m' },
	[FormattingCodes.Gray]: { foreground: '#AAAAAA', background: '#2A2A2A', ansi: '\u001b[0;37m' },
	[FormattingCodes.DarkGray]: { foreground: '#555555', background: '#151515', ansi: '\u001b[0;90m' },
	[FormattingCodes.Blue]: { foreground: '#5555FF', background: '#15153F', ansi: '\u001b[0;94m' },
	[FormattingCodes.Green]: { foreground: '#55FF55', background: '#153F15', ansi: '\u001b[0;92m' },
	[FormattingCodes.Aqua]: { foreground: '#55FFFF', background: '#153F3F', ansi: '\u001b[0;96m' },
	[FormattingCodes.Red]: { foreground: '#FF5555', background: '#3F1515', ansi: '\u001b[0;91m' },
	[FormattingCodes.LightPurple]: { foreground: '#FF55FF', background: '#3F153F', ansi: '\u001b[0;95m' },
	[FormattingCodes.Yellow]: { foreground: '#FFFF55', background: '#3F3F15', ansi: '\u001b[0;93m' },
	[FormattingCodes.White]: { foreground: '#FFFFFF', background: '#3F3F3F', ansi: '\u001b[0;97m' },

	[FormattingCodes.Obfuscated]: { ansi: '\u001b[8m' },
	[FormattingCodes.Bold]: { ansi: '\u001b[1m' },
	[FormattingCodes.Strikethrough]: { ansi: '\u001b[9m' },
	[FormattingCodes.Underline]: { ansi: '\u001b[4m' },
	[FormattingCodes.Italic]: { ansi: '\u001b[3m' },
	[FormattingCodes.Reset]: { ansi: '\u001b[0m' }
} as const;

export type McItemId = Lowercase<string>;
export type SbItemId = Uppercase<string>;
export type MojangJson = string;
export type SbRecipeItem = `${SbItemId}:${number}` | '';
export type SbRecipe = {
	[Location in `${'A' | 'B' | 'C'}${1 | 2 | 3}`]: SbRecipeItem;
};
export type InfoType = 'WIKI_URL' | '';

type Slayer = `${'WOLF' | 'BLAZE' | 'EMAN'}_${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

export interface RawNeuItem {
	itemid: McItemId;
	displayname: string;
	nbttag: MojangJson;
	damage: number;
	lore: string[];
	recipe?: SbRecipe;
	internalname: SbItemId;
	modver: string;
	infoType: InfoType;
	info?: string[];
	crafttext: string;
	vanilla?: boolean;
	useneucraft?: boolean;
	slayer_req?: Slayer;
	clickcommand?: string;
	x?: number;
	y?: number;
	z?: number;
	island?: string;
	recipes?: { type: string; cost: any[]; result: SbItemId }[];
	/** @deprecated */
	parent?: SbItemId;
	noseal?: boolean;
}

export enum HideFlagsBits {
	Enchantments = 1,
	AttributeModifiers = 2,
	Unbreakable = 4,
	CanDestroy = 8,
	CanPlaceOn = 16,
	/**
	 * potion effects, shield pattern info, "StoredEnchantments", written book
	 * "generation" and "author", "Explosion", "Fireworks", and map tooltips
	 */
	OtherInformation = 32,
	Dyed = 64
}

export type HideFlagsString = keyof typeof HideFlagsBits;

export class HideFlags extends BitField<HideFlagsString> {
	public static override Flags = HideFlagsBits;
}

export const formattingCode = new RegExp(
	`§[${Object.values(FormattingCodes)
		.filter((v) => v.startsWith('§'))
		.map((v) => v.substring(1))
		.join('')}]`
);

export function removeMCFormatting(str: string) {
	return str.replaceAll(formattingCode, '');
}

const repo = path.join(__dirname, '..', '..', '..', '..', '..', 'neu-item-repo-dangerous');
const itemPath = path.join(repo, 'items');
const items = await fs.readdir(itemPath);

// for (let i = 0; i < 5; i++) {
for (const path_ of items) {
	// const randomItem = items[Math.floor(Math.random() * items.length)];
	// console.log(randomItem);
	const item = (await import(path.join(itemPath, /* randomItem */ path_), { assert: { type: 'json' } })).default as RawNeuItem;
	if (item.displayname.includes('(Monster)') || item.displayname.includes('(NPC)')) continue;
	/* console.log(path_);
	 console.dir(item, { depth: Infinity }); */

	/* console.log('==========='); */
	const nbt = /* fn( */ parse(item.nbttag /* .replaceAll(/([0-9]{1,3}:)(["{])/g, '$2'), { useMaps: true } */) as any; /*); */
	console.dir(nbt, { depth: Infinity });
	console.log('===========');
	// console.dir((nbt.(item.nbttag)));

	/* 	// eslint-disable-next-line no-inner-declarations
	function fn(map: TagMap) {
		const ret = {} as any;
		map.forEach((val, key) => {
			function fn2(val: any): any {
				if (val instanceof Map) return fn(val);
				else if (Array.isArray(val)) return val.map((v) => fn2(v));
				else return val.valueOf();
			}
			ret[key] = fn2(val);
		});
		return ret;
	} */

	/* if (nbt?.display && nbt.display.Name !== item.displayname)
		console.log(`${path_}		display name mismatch: ${mcToAnsi(nbt.display.Name)} != ${mcToAnsi(item.displayname)}`);

	if (nbt?.ExtraAttributes && nbt?.ExtraAttributes.id !== item.internalname)
		console.log(`${path_}		internal name mismatch: ${mcToAnsi(nbt?.ExtraAttributes.id)} != ${mcToAnsi(item.internalname)}`); */

	/* console.log('===========');

	console.log(mcToAnsi(item.displayname));
	console.log(item.lore.map((l) => mcToAnsi(l)).join('\n')); */

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

interface NbtTag {
	overrideMeta?: Byte;
	Unbreakable?: Int;
	ench?: string[];
	HideFlags?: HideFlags;
	SkullOwner?: SkullOwner;
	display?: NbtTagDisplay;
	ExtraAttributes?: ExtraAttributes;
}

interface SkullOwner {
	Id?: string;
	Properties?: {
		textures?: { Value?: string }[];
	};
}

interface NbtTagDisplay {
	Lore?: string[];
	Name?: string;
}

type RuneId = string;

interface ExtraAttributes {
	originTag?: Origin;
	id?: string;
	generator_tier?: Int;
	boss_tier?: Int;
	enchantments?: { hardened_mana?: Int };
	dungeon_item_level?: Int;
	runes?: { [key: RuneId]: Int };
}

type Origin = 'SHOP_PURCHASE';

class NeuItem {
	public itemId: string;
	public nbtTag: NbtTag;

	public constructor(raw: RawNeuItem) {
		this.itemId = raw.itemid;
		this.nbtTag = <NbtTag>parse(raw.nbttag);
	}

	public get lore(): string {
		return '';
	}

	private pet() {}
}

function mcToAnsi(str: string) {
	for (const format in formattingInfo) {
		str = str.replaceAll(format, formattingInfo[format as keyof typeof formattingInfo].ansi);
	}
	return `${str}\u001b[0m`;
}

const neuConstantsPath = path.join(repo, 'constants');
const neuPetsPath = path.join(neuConstantsPath, 'pets.json');
const neuPets = await import(neuPetsPath, { assert: { type: 'json' } });

// console.dir(await nbt.parse(buffer));
/* console.dir(
	await nbt.parse(
		Buffer.from(
			'{overrideMeta:1b,HideFlags:254,SkullOwner:{Id:"4173bc61-9e2f-3c84-8d31-4517e64062ab",Properties:{textures:[0:{Value:"eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvMjNhYWY3YjFhNzc4OTQ5Njk2Y2I5OWQ0ZjA0YWQxYWE1MThjZWVlMjU2YzcyZTVlZDY1YmZhNWMyZDg4ZDllIn19fQ=="}]}},display:{Lore:[0:"§8Combat Pet",1:"",2:"§7Intelligence: §a{INTELLIGENCE}",3:"§7Strength: §a{STRENGTH}",4:"",5:"§6Rekindle",6:"§7§7Before death, become §eimmune",7:"§e§7and gain §c{0} §c❁ Strength",8:"§c§7for §a{1} §7seconds",9:"§83 minutes cooldown",10:"",11:"§6Fourth Flare",12:"§7§7On 4th melee strike, §6ignite",13:"§6§7mobs, dealing §c{4}x §7your",14:"§7§9☠ Crit Damage §7each second",15:"§7for §a{5} §7seconds",16:"",17:"§7§eRight-click to add this pet to",18:"§eyour pet menu!",19:"",20:"§5§lEPIC"],Name:"§f§f§7[Lvl {LVL}] §5Phoenix"},ExtraAttributes:{petInfo:"{\\"type\\":\\"PHOENIX\\",\\"active\\":false,\\"exp\\":0.0,\\"tier\\":\\"EPIC\\",\\"hideInfo\\":false}",id:"PHOENIX;3"},AttributeModifiers:[]}',
			'utf8'
		)
	)
); */

// import _ from 'lodash';

// const str =
// 	'{overrideMeta:1b,HideFlags:254,SkullOwner:{Id:"4173bc61-9e2f-3c84-8d31-4517e64062ab",Properties:{textures:[0:{Value:"eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvMjNhYWY3YjFhNzc4OTQ5Njk2Y2I5OWQ0ZjA0YWQxYWE1MThjZWVlMjU2YzcyZTVlZDY1YmZhNWMyZDg4ZDllIn19fQ=="}]}},display:{Lore:[0:"§8Combat Pet",1:"",2:"§7Intelligence: §a{INTELLIGENCE}",3:"§7Strength: §a{STRENGTH}",4:"",5:"§6Rekindle",6:"§7§7Before death, become §eimmune",7:"§e§7and gain §c{0} §c❁ Strength",8:"§c§7for §a{1} §7seconds",9:"§83 minutes cooldown",10:"",11:"§6Fourth Flare",12:"§7§7On 4th melee strike, §6ignite",13:"§6§7mobs, dealing §c{4}x §7your",14:"§7§9☠ Crit Damage §7each second",15:"§7for §a{5} §7seconds",16:"",17:"§7§eRight-click to add this pet to",18:"§eyour pet menu!",19:"",20:"§5§lEPIC"],Name:"§f§f§7[Lvl {LVL}] §5Phoenix"},ExtraAttributes:{petInfo:"{\\"type\\":\\"PHOENIX\\",\\"active\\":false,\\"exp\\":0.0,\\"tier\\":\\"EPIC\\",\\"hideInfo\\":false}",id:"PHOENIX;3"},AttributeModifiers:[]}'.replaceAll(
// 		/([0-9]{1,3}:)(["{])/g,
// 		'$2'
// 	);

// console.log(str);

// console.dir(
// 	_.chunk(
// 		str.split('').map((v, i) => [i, v]),
// 		10
// 	).map((v) => [v[0][0], v.map((v) => v[1]).join('')]),
// 	{ maxArrayLength: Infinity, compact: 100 }
// );

// console.dir(parse(str));
