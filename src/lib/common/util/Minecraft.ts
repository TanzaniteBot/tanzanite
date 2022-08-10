import { Byte, Int, parse } from '@ironm00n/nbt-ts';
import { BitField } from 'discord.js';
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
} as const;

export type McItemId = Lowercase<string>;
export type SbItemId = Uppercase<string>;
export type MojangJson = string;
export type SbRecipeItem = `${SbItemId}:${number}` | '';
export type SbRecipe = {
	[Location in `${'A' | 'B' | 'C'}${1 | 2 | 3}`]: SbRecipeItem;
};
export type InfoType = 'WIKI_URL' | '';

export type Slayer = `${'WOLF' | 'BLAZE' | 'EMAN'}_${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`;

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

export interface NbtTag {
	overrideMeta?: Byte;
	Unbreakable?: Int;
	ench?: string[];
	HideFlags?: HideFlags;
	SkullOwner?: SkullOwner;
	display?: NbtTagDisplay;
	ExtraAttributes?: ExtraAttributes;
}

export interface SkullOwner {
	Id?: string;
	Properties?: {
		textures?: { Value?: string }[];
	};
}

export interface NbtTagDisplay {
	Lore?: string[];
	color?: Int;
	Name?: string;
}

export type RuneId = string;

export interface ExtraAttributes {
	originTag?: Origin;
	id?: string;
	generator_tier?: Int;
	boss_tier?: Int;
	enchantments?: { hardened_mana?: Int };
	dungeon_item_level?: Int;
	runes?: { [key: RuneId]: Int };
	petInfo?: PetInfo;
}

export interface PetInfo {
	type: 'ZOMBIE';
	active: boolean;
	exp: number;
	tier: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
	hideInfo: boolean;
	candyUsed: number;
}

export type Origin = 'SHOP_PURCHASE';

const neuConstantsPath = path.join(repo, 'constants');
const neuPetsPath = path.join(neuConstantsPath, 'pets.json');
const neuPets = (await import(neuPetsPath, { assert: { type: 'json' } })) as PetsConstants;
const neuPetNumsPath = path.join(neuConstantsPath, 'petnums.json');
const neuPetNums = (await import(neuPetNumsPath, { assert: { type: 'json' } })) as PetNums;

export interface PetsConstants {
	pet_rarity_offset: Record<string, number>;
	pet_levels: number[];
	custom_pet_leveling: Record<string, { type: number; pet_levels: number[]; max_level: number }>;
	pet_types: Record<string, string>;
}

export interface PetNums {
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

export class NeuItem {
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

			// todo: finish copying from neu

			const minStatsLevel = parseInt(curve?.[0] ?? '0');
			const maxStatsLevel = parseInt(curve?.[0] ?? '100');

			const lore = '';
		}
	}
}

export function mcToAnsi(str: string) {
	for (const format in formattingInfo) {
		str = str.replaceAll(format, formattingInfo[format as keyof typeof formattingInfo].ansi);
	}
	return `${str}\u001b[0m`;
}
