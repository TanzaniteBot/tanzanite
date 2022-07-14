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
	if (/.*?((_MONSTER)|(_NPC)|(_ANIMAL)|(_MINIBOSS)|(_BOSS)|(_SC))$/.test(item.internalname)) continue;
	if (!/.*?;[0-5]$/.test(item.internalname)) continue;
	/* console.log(path_);
	 console.dir(item, { depth: Infinity }); */

	/* console.log('==========='); */
	const nbt = parse(item.nbttag) as NbtTag;

	if (nbt?.SkullOwner?.Properties?.textures?.[0]?.Value) {
		nbt.SkullOwner.Properties.textures[0].Value = parse(
			Buffer.from(nbt.SkullOwner.Properties.textures[0].Value, 'base64').toString('utf-8')
		) as string;
	}

	if (nbt.ExtraAttributes?.petInfo) {
		nbt.ExtraAttributes.petInfo = JSON.parse(nbt.ExtraAttributes.petInfo as any as string);
	}

	// delete nbt.display?.Lore;

	console.dir(nbt, { depth: Infinity });
	console.log('===========');

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
	color?: Int;
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
	petInfo?: PetInfo;
}

interface PetInfo {
	type: 'ZOMBIE';
	active: boolean;
	exp: number;
	tier: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
	hideInfo: boolean;
	candyUsed: number;
}

type Origin = 'SHOP_PURCHASE';

const neuConstantsPath = path.join(repo, 'constants');
const neuPetsPath = path.join(neuConstantsPath, 'pets.json');
const neuPets = (await import(neuPetsPath, { assert: { type: 'json' } })) as PetsConstants;
const neuPetNumsPath = path.join(neuConstantsPath, 'petnums.json');
const neuPetNums = (await import(neuPetNumsPath, { assert: { type: 'json' } })) as PetNums;

interface PetsConstants {
	pet_rarity_offset: Record<string, number>;
	pet_levels: number[];
	custom_pet_leveling: Record<string, { type: number; pet_levels: number[]; max_level: number }>;
	pet_types: Record<string, string>;
}

interface PetNums {
	[key: string]: {
		[key: string]: {
			'1': {
				otherNums: number[];
				statNums: Record<string, number>;
			};
			'100': {
				otherNums: number[];
				statNums: Record<string, number>;
			};
			'stats_levelling_curve'?: `${number};${number};${number}`;
		};
	};
}

class NeuItem {
	public itemId: McItemId;
	public displayName: string;
	public nbtTag: NbtTag;
	public internalName: SbItemId;
	public lore: string[];

	public constructor(raw: RawNeuItem) {
		this.itemId = raw.itemid;
		this.nbtTag = <NbtTag>parse(raw.nbttag);
		this.displayName = raw.displayname;
		this.internalName = raw.internalname;
		this.lore = raw.lore;

		this.petLoreReplacements();
	}

	private petLoreReplacements(level = -1) {
		if (/.*?;[0-5]$/.test(this.internalName) && this.displayName.includes('LVL')) {
			const maxLevel = neuPets?.custom_pet_leveling?.[this.internalName]?.max_level ?? 100;
			this.displayName = this.displayName.replace('LVL', `1➡${maxLevel}`);

			const nums = neuPetNums[this.internalName];
			if (!nums) throw new Error(`Pet (${this.internalName}) has no pet nums.`);

			const teir = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'][+this.internalName.at(-1)!];
			const petInfoTier = nums[teir];
			if (!petInfoTier) throw new Error(`Pet (${this.internalName}) has no pet nums for ${teir} rarity.`);

			const curve = petInfoTier?.stats_levelling_curve?.split(';');

			const minStatsLevel = parseInt(curve?.[0] ?? '0');
			const maxStatsLevel = parseInt(curve?.[0] ?? '100');

			const lore = '';
		}
	}
}

function mcToAnsi(str: string) {
	for (const format in formattingInfo) {
		str = str.replaceAll(format, formattingInfo[format as keyof typeof formattingInfo].ansi);
	}
	return `${str}\u001b[0m`;
}
