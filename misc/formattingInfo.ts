type McItemId = Lowercase<string>;
type SbItemId = Uppercase<string>;
type MojangJson = string;
type SbRecipeItem = `${SbItemId}:${number}` | '';
type SbRecipe = {
	[Location in `${'A' | 'B' | 'C'}${1 | 2 | 3}`]: SbRecipeItem;
};
type InfoType = 'WIKI_URL' | '';
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

export type Color =
	| FormattingCodes.Black
	| FormattingCodes.DarkBlue
	| FormattingCodes.DarkGreen
	| FormattingCodes.DarkAqua
	| FormattingCodes.DarkRed
	| FormattingCodes.DarkPurple
	| FormattingCodes.Gold
	| FormattingCodes.Gray
	| FormattingCodes.DarkGray
	| FormattingCodes.Blue
	| FormattingCodes.Green
	| FormattingCodes.Aqua
	| FormattingCodes.Red
	| FormattingCodes.LightPurple
	| FormattingCodes.Yellow
	| FormattingCodes.White;

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

export type ColorCode = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
