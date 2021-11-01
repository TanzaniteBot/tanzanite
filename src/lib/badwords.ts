import { Severity, type BadWords } from "./common/AutoMod.js";

export default {
	/* -------------------------------------------------------------------------- */
	/*                                    Slurs                                   */
	/* -------------------------------------------------------------------------- */
	"faggot": {
		severity: Severity.TEMP_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "racial slur",
		regex: false,
	},
	"nigga": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "racial slur",
		regex: false,
	},
	"nigger": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "racial slur",
		regex: false,
	},
	"nigra": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "racial slur",
		regex: false,
	},
	"retard": {
		severity: Severity.TEMP_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "ableist slur",
		regex: false,
	},
	"retarted": {
		severity: Severity.TEMP_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "ableist slur",
		regex: false,
	},
	"slut": {
		severity: Severity.WARN,
		ignoreSpaces: false,
		ignoreCapitalization: true,
		reason: "derogatory term",
		regex: false,
	},
	"tar baby": {
		severity: Severity.TEMP_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "racial slur",
		regex: false,
	},
	"whore": {
		severity: Severity.WARN,
		ignoreSpaces: false,
		ignoreCapitalization: true,
		reason: "derogatory term",
		regex: false,
	},
	"卍": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "racist symbol",
		regex: false,
	},

	/* -------------------------------------------------------------------------- */
	/*                                 Steam Scams                                */
	/* -------------------------------------------------------------------------- */
	'Я в тильте, в кс дали статус "Ненадежный"': {
		//? I'm on tilt, in the cop they gave the status "Unreliable"
		severity: Severity.WARN,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
		regex: false,
	},
	"hello i am leaving cs:go": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
		regex: false,
	},
	"hello! I'm done with csgo": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
		regex: false,
	},
	"hi bro, i'm leaving this fucking game, take my skin": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
		regex: false,
	},
	"hi friend, today i am leaving this fucking game": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
		regex: false,
	},
	"hi guys, i'm leaving this fucking game, take my": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
		regex: false,
	},
	"hi, bro h am leaving cs:go and giving away my skin": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
		regex: false,
	},
	"hi, bro i am leaving cs:go and giving away my skin": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
		regex: false,
	},
	"i confirm all exchanges, there won't be enough": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
		regex: false,
	},
	"i quit csgo": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
		regex: false,
	},
	"the first three who send a trade": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
		regex: false,
	},
	"you can choose any skin for yourself": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
		regex: false,
	},

	/* -------------------------------------------------------------------------- */
	/*                                 Nitro Scams                                */
	/* -------------------------------------------------------------------------- */
	"and there is discord hallween's giveaway": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"discord nitro for free - steam store": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"free 3 months of discord nitro": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"free discord nitro airdrop": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"get 3 months of discord nitro": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"get discord nitro for free": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"get free discord nitro from steam": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"lol, jahjajha free discord nitro for 3 month!!": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"steam is giving away 3 months of discord nitro for free to all no limited steam users": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"Лол, бесплатный дискорд нитро на 1 месяц!": {
		//? Lol, 1 month free discord nitro!
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"Airdrop Discord FREE NITRO from Steam —": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"take nitro faster, it's already running out": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: false,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"only the first 10 people will have time to take nitro": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: false,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"Discord is giving away nitro!": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: false,
		ignoreCapitalization: false,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"Free gift discord nitro for 1 month!": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: false,
		ignoreCapitalization: false,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"Hi i claim this nitro for free 3 months lol!": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"bro watch this, working nitro gen": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: false,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
		regex: false,
	},
	"Free distribution of discord nitro for 3 months from steam!": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
		regex: false,
	},

	/* -------------------------------------------------------------------------- */
	/*                                 Misc Scams                                 */
	/* -------------------------------------------------------------------------- */
	"found a cool software that improves the": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "misc. scam phrase",
		regex: false,
	},
	"there is a possible chance tomorrow there will be a cyber-attack event where on all social networks including Discord there will be people trying":
		{
			severity: Severity.WARN,
			ignoreSpaces: false,
			ignoreCapitalization: true,
			reason: "annoying copy pasta",
			regex: false,
		},

	/* -------------------------------------------------------------------------- */
	/*                    Frequently Advertised Discord Severs                    */
	/* -------------------------------------------------------------------------- */
	"https://discord.gg/7CaCvDXs": {
		severity: Severity.TEMP_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "blacklisted server link",
		regex: false,
	},
} as BadWords;
