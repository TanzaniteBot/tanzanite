import { BadWords, Severity } from "./common/automod";

export default {
	/* -------------------------------------------------------------------------- */
	/*                                    Slurs                                   */
	/* -------------------------------------------------------------------------- */
	"faggot": {
		severity: Severity.TEMP_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "racial slur",
	},
	"nigga": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "racial slur",
	},
	"nigger": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "racial slur",
	},
	"nigra": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "racial slur",
	},
	"retard": {
		severity: Severity.TEMP_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "ableist slur",
	},
	"retarted": {
		severity: Severity.TEMP_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "ableist slur",
	},
	"slut": {
		severity: Severity.WARN,
		ignoreSpaces: false,
		ignoreCapitalization: true,
		reason: "derogatory term",
	},
	"tar baby": {
		severity: Severity.TEMP_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "racial slur",
	},
	"whore": {
		severity: Severity.WARN,
		ignoreSpaces: false,
		ignoreCapitalization: true,
		reason: "derogatory term",
	},
	"卍": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "racist symbol",
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
	},
	"hello i am leaving cs:go": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
	},
	"hello! I'm done with csgo": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
	},
	"hi bro, i'm leaving this fucking game, take my skin": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
	},
	"hi friend, today i am leaving this fucking game": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
	},
	"hi guys, i'm leaving this fucking game, take my": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
	},
	"hi, bro h am leaving cs:go and giving away my skin": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
	},
	"hi, bro i am leaving cs:go and giving away my skin": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
	},
	"i confirm all exchanges, there won't be enough": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
	},
	"i quit csgo": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
	},
	"the first three who send a trade": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
	},
	"you can choose any skin for yourself": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "steam scam phrase",
	},

	/* -------------------------------------------------------------------------- */
	/*                                 Nitro Scams                                */
	/* -------------------------------------------------------------------------- */
	"and there is discord hallween's giveaway": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
	},
	"discord nitro for free - steam store": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
	},
	"free 3 months of discord nitro": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
	},
	"free discord nitro airdrop": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
	},
	"get 3 months of discord nitro": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
	},
	"get discord nitro for free": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
	},
	"get free discord nitro from steam": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
	},
	"lol, jahjajha free discord nitro for 3 month!!": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
	},
	"steam is giving away 3 months of discord nitro for free to all no limited steam users": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
	},
	"Лол, бесплатный дискорд нитро на 1 месяц!": {
		//? Lol, 1 month free discord nitro!
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
	},
	"Airdrop Discord FREE NITRO from Steam —": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "discord nitro scam phrase",
	},

	/* -------------------------------------------------------------------------- */
	/*                                 Misc Scams                                 */
	/* -------------------------------------------------------------------------- */
	"found a cool software that improves the": {
		severity: Severity.PERM_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "misc. scam phrase",
	},
	"there is a possible chance tomorrow there will be a cyber-attack event where on all social networks including Discord there will be people trying":
		{
			severity: Severity.WARN,
			ignoreSpaces: false,
			ignoreCapitalization: true,
			reason: "annoying copy pasta",
		},

	/* -------------------------------------------------------------------------- */
	/*                    Frequently Advertised Discord Severs                    */
	/* -------------------------------------------------------------------------- */
	"https://discord.gg/7CaCvDXs": {
		severity: Severity.TEMP_MUTE,
		ignoreSpaces: true,
		ignoreCapitalization: true,
		reason: "blacklisted server link",
	},
} as BadWords;
