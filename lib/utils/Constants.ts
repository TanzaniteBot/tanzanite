import { default as deepLock } from 'deep-lock';
import { Colors, GuildFeature, Snowflake } from 'discord.js';

const rawCapeUrl = 'https://raw.githubusercontent.com/NotEnoughUpdates/capes/master/';

/**
 * Time units in milliseconds
 */
export const enum Time {
	/**
	 * One millisecond (1 ms).
	 */
	Millisecond = 1,

	/**
	 * One second (1,000 ms).
	 */
	Second = Millisecond * 1000,

	/**
	 * One minute (60,000 ms).
	 */
	Minute = Second * 60,

	/**
	 * One hour (3,600,000 ms).
	 */
	Hour = Minute * 60,

	/**
	 * One day (86,400,000 ms).
	 */
	Day = Hour * 24,

	/**
	 * One week (604,800,000 ms).
	 */
	Week = Day * 7,

	/**
	 * One month (2,629,800,000 ms).
	 */
	Month = Day * 30.4375, // average of days in a month (including leap years)

	/**
	 * One year (31,557,600,000 ms).
	 */
	Year = Day * 365.25 // average with leap years
}

export const emojis = Object.freeze({
	success: '<:success:837109864101707807>',
	warn: '<:warn:848726900876247050>',
	error: '<:error:837123021016924261>',
	successFull: '<:success_full:850118767576088646>',
	warnFull: '<:warn_full:850118767391539312>',
	errorFull: '<:error_full:850118767295201350>',
	mad: '<:mad:783046135392239626>',
	join: '<:join:850198029809614858>',
	leave: '<:leave:850198048205307919>',
	loading: '<a:Loading:853419254619963392>',
	offlineCircle: '<:offline:787550565382750239>',
	dndCircle: '<:dnd:787550487633330176>',
	idleCircle: '<:idle:787550520956551218>',
	onlineCircle: '<:online:787550449435803658>',
	cross: '<:cross:878319362539421777>',
	check: '<:check:878320135297961995>'
} as const);

export const emojisRaw = Object.freeze({
	success: '837109864101707807',
	warn: '848726900876247050',
	error: '837123021016924261',
	successFull: '850118767576088646',
	warnFull: '850118767391539312',
	errorFull: '850118767295201350',
	mad: '783046135392239626',
	join: '850198029809614858',
	leave: '850198048205307919',
	loading: '853419254619963392',
	offlineCircle: '787550565382750239',
	dndCircle: '787550487633330176',
	idleCircle: '787550520956551218',
	onlineCircle: '787550449435803658',
	cross: '878319362539421777',
	check: '878320135297961995'
} as const);

export const colors = Object.freeze({
	default: 0x1fd8f1,
	error: 0xef4947,
	warn: 0xfeba12,
	success: 0x3bb681,
	info: 0x3b78ff,
	red: 0xff0000,
	blue: 0x0055ff,
	aqua: 0x00bbff,
	purple: 0x8400ff,
	blurple: 0x5440cd,
	newBlurple: 0x5865f2,
	pink: 0xff00e6,
	green: 0x00ff1e,
	darkGreen: 0x008f11,
	gold: 0xb59400,
	yellow: 0xffff00,
	white: 0xffffff,
	gray: 0xa6a6a6,
	lightGray: 0xcfcfcf,
	darkGray: 0x7a7a7a,
	black: 0x000000,
	orange: 0xe86100,
	...Colors
} as const);

// Somewhat stolen from @Mzato0001
export const timeUnits = deepLock({
	milliseconds: {
		match: / (?:(?<milliseconds>-?(?:\d+)?\.?\d+) *(?:milliseconds?|msecs?|ms))/im,
		value: Time.Millisecond
	},
	seconds: {
		match: / (?:(?<seconds>-?(?:\d+)?\.?\d+) *(?:seconds?|secs?|s))/im,
		value: Time.Second
	},
	minutes: {
		match: / (?:(?<minutes>-?(?:\d+)?\.?\d+) *(?:minutes?|mins?|m))/im,
		value: Time.Minute
	},
	hours: {
		match: / (?:(?<hours>-?(?:\d+)?\.?\d+) *(?:hours?|hrs?|h))/im,
		value: Time.Hour
	},
	days: {
		match: / (?:(?<days>-?(?:\d+)?\.?\d+) *(?:days?|d))/im,
		value: Time.Day
	},
	weeks: {
		match: / (?:(?<weeks>-?(?:\d+)?\.?\d+) *(?:weeks?|w))/im,
		value: Time.Week
	},
	months: {
		match: / (?:(?<months>-?(?:\d+)?\.?\d+) *(?:months?|mon|mo))/im,
		value: Time.Month
	},
	years: {
		match: / (?:(?<years>-?(?:\d+)?\.?\d+) *(?:years?|y))/im,
		value: Time.Year
	}
} as const);

export const regex = deepLock({
	snowflake: /^\d{15,21}$/im,

	discordEmoji: /<a?:(?<name>[a-zA-Z0-9_]+):(?<id>\d{15,21})>/im,

	/*
	 * Taken with permission from Geek:
	 * https://github.com/FireDiscordBot/bot/blob/5d1990e5f8b52fcc72261d786aa3c7c7c65ab5e8/lib/util/constants.ts#L276
	 */
	/** **This has the global flag, make sure to handle it correctly.** */
	messageLink:
		/<?https:\/\/(?:ptb\.|canary\.|staging\.)?discord(?:app)?\.com?\/channels\/(?<guild_id>\d{15,21})\/(?<channel_id>\d{15,21})\/(?<message_id>\d{15,21})>?/gim
} as const);

/**
 * Maps the response from pronoundb.org to a readable format
 */
export const pronounMapping = Object.freeze({
	unspecified: 'Unspecified',
	hh: 'He/Him',
	hi: 'He/It',
	hs: 'He/She',
	ht: 'He/They',
	ih: 'It/Him',
	ii: 'It/Its',
	is: 'It/She',
	it: 'It/They',
	shh: 'She/He',
	sh: 'She/Her',
	si: 'She/It',
	st: 'She/They',
	th: 'They/He',
	ti: 'They/It',
	ts: 'They/She',
	tt: 'They/Them',
	any: 'Any pronouns',
	other: 'Other pronouns',
	ask: 'Ask me my pronouns',
	avoid: 'Avoid pronouns, use my name'
} as const);

/**
 * A bunch of mappings
 */
export const mappings = deepLock({
	guilds: {
		"Moulberry's Bush": '516977525906341928',
		"Moulberry's Tree": '767448775450820639',
		'MB Staff': '784597260465995796',
		"IRONM00N's Space Ship": '717176538717749358'
	},

	channels: {
		'neu-support': '714332750156660756',
		'giveaways': '767782084981817344'
	},

	users: {
		IRONM00N: '322862723090219008',
		Moulberry: '211288288055525376',
		nopo: '384620942577369088',
		Bestower: '496409778822709251'
	},

	permissions: {
		CreateInstantInvite: { name: 'Create Invite', important: false },
		KickMembers: { name: 'Kick Members', important: true },
		BanMembers: { name: 'Ban Members', important: true },
		Administrator: { name: 'Administrator', important: true },
		ManageChannels: { name: 'Manage Channels', important: true },
		ManageGuild: { name: 'Manage Server', important: true },
		AddReactions: { name: 'Add Reactions', important: false },
		ViewAuditLog: { name: 'View Audit Log', important: true },
		PrioritySpeaker: { name: 'Priority Speaker', important: true },
		Stream: { name: 'Video', important: false },
		ViewChannel: { name: 'View Channel', important: false },
		SendMessages: { name: 'Send Messages', important: false },
		SendTTSMessages: { name: 'Send Text-to-Speech Messages', important: true },
		ManageMessages: { name: 'Manage Messages', important: true },
		EmbedLinks: { name: 'Embed Links', important: false },
		AttachFiles: { name: 'Attach Files', important: false },
		ReadMessageHistory: { name: 'Read Message History', important: false },
		MentionEveryone: { name: 'Mention @\u200Beveryone, @\u200Bhere, and All Roles', important: true }, // name has a zero-width space to prevent accidents
		UseExternalEmojis: { name: 'Use External Emoji', important: false },
		ViewGuildInsights: { name: 'View Server Insights', important: true },
		Connect: { name: 'Connect', important: false },
		Speak: { name: 'Speak', important: false },
		MuteMembers: { name: 'Mute Members', important: true },
		DeafenMembers: { name: 'Deafen Members', important: true },
		MoveMembers: { name: 'Move Members', important: true },
		UseVAD: { name: 'Use Voice Activity', important: false },
		ChangeNickname: { name: 'Change Nickname', important: false },
		ManageNicknames: { name: 'Change Nicknames', important: true },
		ManageRoles: { name: 'Manage Roles', important: true },
		ManageWebhooks: { name: 'Manage Webhooks', important: true },
		ManageEmojisAndStickers: { name: 'Manage Emojis and Stickers', important: true },
		UseApplicationCommands: { name: 'Use Slash Commands', important: false },
		RequestToSpeak: { name: 'Request to Speak', important: false },
		ManageEvents: { name: 'Manage Events', important: true },
		ManageThreads: { name: 'Manage Threads', important: true },
		CreatePublicThreads: { name: 'Create Public Threads', important: false },
		CreatePrivateThreads: { name: 'Create Private Threads', important: false },
		UseExternalStickers: { name: 'Use External Stickers', important: false },
		SendMessagesInThreads: { name: 'Send Messages In Threads', important: false },
		StartEmbeddedActivities: { name: 'Start Activities', important: false },
		ModerateMembers: { name: 'Timeout Members', important: true },
		UseEmbeddedActivities: { name: 'Use Activities', important: false }
	},

	// prettier-ignore
	features: {
			[GuildFeature.Verified]: { name: 'Verified', important: true, emoji: '<:verified:850795049817473066>', weight: 0 },
			[GuildFeature.Partnered]: { name: 'Partnered', important: true, emoji: '<:partneredServer:850794851955507240>', weight: 1 },
			[GuildFeature.MoreStickers]: { name: 'More Stickers', important: true, emoji: null, weight: 2 },
			MORE_EMOJIS: { name: 'More Emoji', important: true, emoji: '<:moreEmoji:850786853497602080>', weight: 3 },
			[GuildFeature.Featurable]: { name: 'Featurable', important: true, emoji: '<:featurable:850786776372084756>', weight: 4 },
			[GuildFeature.RelayEnabled]: { name: 'Relay Enabled', important: true, emoji: '<:relayEnabled:850790531441229834>', weight: 5 },
			[GuildFeature.Discoverable]: { name: 'Discoverable', important: true, emoji: '<:discoverable:850786735360966656>', weight: 6 },
			ENABLED_DISCOVERABLE_BEFORE: { name: 'Enabled Discovery Before', important: false, emoji: '<:enabledDiscoverableBefore:850786754670624828>', weight: 7 },
			[GuildFeature.MonetizationEnabled]: { name: 'Monetization Enabled', important: true, emoji: null, weight: 8 },
			[GuildFeature.TicketedEventsEnabled]: { name: 'Ticketed Events Enabled', important: true, emoji: null, weight: 9 },
			[GuildFeature.PreviewEnabled]: { name: 'Preview Enabled', important: true, emoji: '<:previewEnabled:850790508266913823>', weight: 10 },
			COMMERCE: { name: 'Store Channels', important: true, emoji: '<:storeChannels:850786692432396338>', weight: 11 },
			[GuildFeature.VanityURL]: { name: 'Vanity URL', important: false, emoji: '<:vanityURL:850790553079644160>', weight: 12 },
			[GuildFeature.VIPRegions]: { name: 'VIP Regions', important: false, emoji: '<:VIPRegions:850794697496854538>', weight: 13 },
			[GuildFeature.AnimatedIcon]: { name: 'Animated Icon', important: false, emoji: '<:animatedIcon:850774498071412746>', weight: 14 },
			[GuildFeature.Banner]: { name: 'Banner', important: false, emoji: '<:banner:850786673150787614>', weight: 15 },
			[GuildFeature.InviteSplash]: { name: 'Invite Splash', important: false, emoji: '<:inviteSplash:850786798246559754>', weight: 16 },
			[GuildFeature.PrivateThreads]: { name: 'Private Threads', important: false, emoji: '<:privateThreads:869763711894700093>', weight: 17 },
			THREE_DAY_THREAD_ARCHIVE: { name: 'Three Day Thread Archive', important: false, emoji: '<:threeDayThreadArchive:869767841652564008>', weight: 19 },
			SEVEN_DAY_THREAD_ARCHIVE: { name: 'Seven Day Thread Archive', important: false, emoji: '<:sevenDayThreadArchive:869767896123998288>', weight: 20 },
			[GuildFeature.RoleIcons]: { name: 'Role Icons', important: false, emoji: '<:roleIcons:876993381929222175>', weight: 21 },
			[GuildFeature.News]: { name: 'Announcement Channels', important: false, emoji: '<:announcementChannels:850790491796013067>', weight: 22 },
			[GuildFeature.MemberVerificationGateEnabled]: { name: 'Membership Verification Gate', important: false, emoji: '<:memberVerificationGateEnabled:850786829984858212>', weight: 23 },
			[GuildFeature.WelcomeScreenEnabled]: { name: 'Welcome Screen Enabled', important: false, emoji: '<:welcomeScreenEnabled:850790575875817504>', weight: 24 },
			[GuildFeature.Community]: { name: 'Community', important: false, emoji: '<:community:850786714271875094>', weight: 25 },
			THREADS_ENABLED: {name: 'Threads Enabled', important: false, emoji: '<:threadsEnabled:869756035345317919>', weight: 26 },
			THREADS_ENABLED_TESTING: {name: 'Threads Enabled Testing', important: false, emoji: null, weight: 27 },
			[GuildFeature.AnimatedBanner]: { name: 'Animated Banner', important: false, emoji: '<:animatedBanner:1010580022018449482>', weight: 28 },
			[GuildFeature.HasDirectoryEntry]: { name: 'Has Directory Entry', important: true, emoji: null, weight: 29 },
			[GuildFeature.Hub]: { name: 'Hub', important: true, emoji: null, weight: 30 },
			[GuildFeature.LinkedToHub]: { name: 'Linked To Hub', important: true, emoji: null, weight: 31 },
			TEXT_IN_VOICE_ENABLED: { name: 'Text In Voice Enabled', important: false, emoji: '<:textInVoiceEnabled:1010578210150424617>', weight: 32 },
			AUTO_MODERATION: { name: 'Auto Moderation', important: false, emoji: '<:autoModeration:1010579417942200321>', weight: 33 },
			MEMBER_PROFILES: { name: 'Member Profiles', important: false, emoji: '<:memberProfiles:1010580480409747547>', weight: 34 },
			NEW_THREAD_PERMISSIONS: { name: 'New Thread Permissions', important: false, emoji: '<:newThreadPermissions:1010580968442171492>', weight: 35 },
		},

	regions: {
		'automatic': ':united_nations: Automatic',
		'brazil': ':flag_br: Brazil',
		'europe': ':flag_eu: Europe',
		'hongkong': ':flag_hk: Hongkong',
		'india': ':flag_in: India',
		'japan': ':flag_jp: Japan',
		'russia': ':flag_ru: Russia',
		'singapore': ':flag_sg: Singapore',
		'southafrica': ':flag_za: South Africa',
		'sydney': ':flag_au: Sydney',
		'us-central': ':flag_us: US Central',
		'us-east': ':flag_us: US East',
		'us-south': ':flag_us: US South',
		'us-west': ':flag_us: US West'
	},

	otherEmojis: {
		ServerBooster1: '<:serverBooster1:848740052091142145>',
		ServerBooster2: '<:serverBooster2:848740090506510388>',
		ServerBooster3: '<:serverBooster3:848740124992077835>',
		ServerBooster6: '<:serverBooster6:848740155245461514>',
		ServerBooster9: '<:serverBooster9:848740188846030889>',
		ServerBooster12: '<:serverBooster12:848740304365551668>',
		ServerBooster15: '<:serverBooster15:848740354890137680>',
		ServerBooster18: '<:serverBooster18:848740402886606868>',
		ServerBooster24: '<:serverBooster24:848740444628320256>',
		Nitro: '<:nitro:848740498054971432>',
		Booster: '<:booster:848747775020892200>',
		Owner: '<:owner:848746439311753286>',
		Admin: '<:admin:848963914628333598>',
		Superuser: '<:superUser:848947986326224926>',
		Developer: '<:developer:848954538111139871>',
		Bot: '<:bot:1006929813203853427>',
		BushVerified: '<:verfied:853360152090771497>',
		BoostTier1: '<:boostitle:853363736679940127>',
		BoostTier2: '<:boostitle:853363752728789075>',
		BoostTier3: '<:boostitle:853363769132056627>',
		ChannelText: '<:text:853375537791893524>',
		ChannelNews: '<:announcements:853375553531674644>',
		ChannelVoice: '<:voice:853375566735212584>',
		ChannelStage: '<:stage:853375583521210468>',
		// ChannelStore: '<:store:853375601175691266>',
		ChannelCategory: '<:category:853375615260819476>',
		ChannelThread: '<:thread:865033845753249813>'
	},

	userFlags: {
		Staff: '<:discordEmployee:848742947826434079>',
		Partner: '<:partneredServerOwner:848743051593777152>',
		Hypesquad: '<:hypeSquadEvents:848743108283072553>',
		BugHunterLevel1: '<:bugHunter:848743239850393640>',
		HypeSquadOnlineHouse1: '<:hypeSquadBravery:848742910563844127>',
		HypeSquadOnlineHouse2: '<:hypeSquadBrilliance:848742840649646101>',
		HypeSquadOnlineHouse3: '<:hypeSquadBalance:848742877537370133>',
		PremiumEarlySupporter: '<:earlySupporter:848741030102171648>',
		TeamPseudoUser: '`TeamPseudoUser`',
		BugHunterLevel2: '<:bugHunterGold:848743283080822794>',
		VerifiedBot: '<:verifiedbot1:938928232667947028><:verifiedbot2:938928355707879475>',
		VerifiedDeveloper: '<:earlyVerifiedBotDeveloper:848741079875846174>',
		CertifiedModerator: '<:discordCertifiedModerator:877224285901582366>',
		BotHTTPInteractions: '`BotHTTPInteractions`',
		Spammer: '`Spammer`',
		Quarantined: '`Quarantined`'
	},

	status: {
		online: '<:online:848937141639577690>',
		idle: '<:idle:848937158261211146>',
		dnd: '<:dnd:848937173780135986>',
		offline: '<:offline:848939387277672448>',
		streaming: '<:streaming:848937187479519242>'
	},

	commonNitroDiscriminators: ['1111', '2222', '3333', '4444', '5555', '6666', '6969', '7777', '8888', '9999'],

	capes: [
		/* supporter capes */
		{ name: 'patreon1', purchasable: false /* moulberry no longer offers */ },
		{ name: 'patreon2', purchasable: false /* moulberry no longer offers */ },
		{ name: 'fade', custom: `${rawCapeUrl}fade.gif`, purchasable: true },
		{ name: 'lava', custom: `${rawCapeUrl}lava.gif`, purchasable: true },
		{ name: 'mcworld', custom: `${rawCapeUrl}mcworld_compressed.gif`, purchasable: true },
		{ name: 'negative', custom: `${rawCapeUrl}negative_compressed.gif`, purchasable: true },
		{ name: 'space', custom: `${rawCapeUrl}space_compressed.gif`, purchasable: true },
		{ name: 'void', custom: `${rawCapeUrl}void.gif`, purchasable: true },
		{ name: 'tunnel', custom: `${rawCapeUrl}tunnel.gif`, purchasable: true },
		/* Staff capes */
		{ name: 'contrib' },
		{ name: 'mbstaff' },
		{ name: 'ironmoon' },
		{ name: 'gravy' },
		{ name: 'nullzee' },
		/* partner capes */
		{ name: 'thebakery' },
		{ name: 'dsm' },
		{ name: 'packshq' },
		{ name: 'furf' },
		{ name: 'skytils' },
		{ name: 'sbp' },
		{ name: 'subreddit_light' },
		{ name: 'subreddit_dark' },
		{ name: 'skyclient' },
		{ name: 'sharex' },
		{ name: 'sharex_white' },
		/* streamer capes */
		{ name: 'alexxoffi' },
		{ name: 'jakethybro' },
		{ name: 'krusty' },
		{ name: 'krusty_day' },
		{ name: 'krusty_night' },
		{ name: 'krusty_sunset' },
		{ name: 'soldier' },
		{ name: 'zera' },
		{ name: 'secondpfirsisch' },
		{ name: 'stormy_lh' }
	].map((value, index) => ({ ...value, index })),

	roleMap: [
		{ name: '*', id: '792453550768390194' },
		{ name: 'Admin Perms', id: '746541309853958186' },
		{ name: 'Sr. Moderator', id: '782803470205190164' },
		{ name: 'Moderator', id: '737308259823910992' },
		{ name: 'Helper', id: '737440116230062091' },
		{ name: 'Trial Helper', id: '783537091946479636' },
		{ name: 'Contributor', id: '694431057532944425' },
		{ name: 'Giveaway Donor', id: '784212110263451649' },
		{ name: 'Giveaway (200m)', id: '810267756426690601' },
		{ name: 'Giveaway (100m)', id: '801444430522613802' },
		{ name: 'Giveaway (50m)', id: '787497512981757982' },
		{ name: 'Giveaway (25m)', id: '787497515771232267' },
		{ name: 'Giveaway (10m)', id: '787497518241153025' },
		{ name: 'Giveaway (5m)', id: '787497519768403989' },
		{ name: 'Giveaway (1m)', id: '787497521084891166' },
		{ name: 'Suggester', id: '811922322767609877' },
		{ name: 'Partner', id: '767324547312779274' },
		{ name: 'Level Locked', id: '784248899044769792' },
		{ name: 'No Files', id: '786421005039173633' },
		{ name: 'No Reactions', id: '786421270924361789' },
		{ name: 'No Links', id: '786421269356740658' },
		{ name: 'No Bots', id: '786804858765312030' },
		{ name: 'No VC', id: '788850482554208267' },
		{ name: 'No Giveaways', id: '808265422334984203' },
		{ name: 'No Support', id: '790247359824396319' }
	],

	roleWhitelist: {
		'Partner': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Suggester': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator', 'Helper', 'Trial Helper', 'Contributor'],
		'Level Locked': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No Files': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No Reactions': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No Links': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No Bots': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No VC': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'No Giveaways': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator', 'Helper'],
		'No Support': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Giveaway Donor': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Giveaway (200m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Giveaway (100m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Giveaway (50m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Giveaway (25m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Giveaway (10m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Giveaway (5m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator'],
		'Giveaway (1m)': ['*', 'Admin Perms', 'Sr. Moderator', 'Moderator']
	}
} as const);

interface BotInfo {
	applicationId: Snowflake;
}

export const bots: Record<Snowflake, BotInfo> = {
	// MEE6#4876
	'159985870458322944': {
		applicationId: '159985415099514880'
	},
	// Dyno
	'155149108183695360': {
		applicationId: '161660517914509312'
	},
	// Tatsu#8792
	'172002275412279296': {
		applicationId: '172002255350792192'
	},
	// YAGPDB.xyz#8760
	'204255221017214977': {
		applicationId: '204255083083333633'
	}
};

export const moulberryBushRoleMap = deepLock([
	{ name: '*', id: '792453550768390194' },
	{ name: 'Admin Perms', id: '746541309853958186' },
	{ name: 'Sr. Moderator', id: '782803470205190164' },
	{ name: 'Moderator', id: '737308259823910992' },
	{ name: 'Helper', id: '737440116230062091' },
	{ name: 'Trial Helper', id: '783537091946479636' },
	{ name: 'Contributor', id: '694431057532944425' },
	{ name: 'Giveaway Donor', id: '784212110263451649' },
	{ name: 'Giveaway (200m)', id: '810267756426690601' },
	{ name: 'Giveaway (100m)', id: '801444430522613802' },
	{ name: 'Giveaway (50m)', id: '787497512981757982' },
	{ name: 'Giveaway (25m)', id: '787497515771232267' },
	{ name: 'Giveaway (10m)', id: '787497518241153025' },
	{ name: 'Giveaway (5m)', id: '787497519768403989' },
	{ name: 'Giveaway (1m)', id: '787497521084891166' },
	{ name: 'Suggester', id: '811922322767609877' },
	{ name: 'Partner', id: '767324547312779274' },
	{ name: 'Level Locked', id: '784248899044769792' },
	{ name: 'No Files', id: '786421005039173633' },
	{ name: 'No Reactions', id: '786421270924361789' },
	{ name: 'No Links', id: '786421269356740658' },
	{ name: 'No Bots', id: '786804858765312030' },
	{ name: 'No VC', id: '788850482554208267' },
	{ name: 'No Giveaways', id: '808265422334984203' },
	{ name: 'No Support', id: '790247359824396319' }
] as const);

export type PronounCode = keyof typeof pronounMapping;
export type Pronoun = typeof pronounMapping[PronounCode];

export const enum ArgumentMatches {
	Phrase = 'phrase',
	Flag = 'flag',
	Option = 'option',
	Rest = 'rest',
	Separate = 'separate',
	Text = 'text',
	Content = 'content',
	RestContent = 'restContent',
	None = 'none'
}

export const enum ArgumentTypes {
	String = 'string',
	Lowercase = 'lowercase',
	Uppercase = 'uppercase',
	CharCodes = 'charCodes',
	Number = 'number',
	Integer = 'integer',
	Bigint = 'bigint',
	Emojint = 'emojint',
	Url = 'url',
	Date = 'date',
	Color = 'color',
	User = 'user',
	Users = 'users',
	Member = 'member',
	Members = 'members',
	Relevant = 'relevant',
	Relevants = 'relevants',
	Channel = 'channel',
	Channels = 'channels',
	TextChannel = 'textChannel',
	TextChannels = 'textChannels',
	VoiceChannel = 'voiceChannel',
	VoiceChannels = 'voiceChannels',
	CategoryChannel = 'categoryChannel',
	CategoryChannels = 'categoryChannels',
	NewsChannel = 'newsChannel',
	NewsChannels = 'newsChannels',
	StageChannel = 'stageChannel',
	StageChannels = 'stageChannels',
	ThreadChannel = 'threadChannel',
	ThreadChannels = 'threadChannels',
	DirectoryChannel = 'directoryChannel',
	DirectoryChannels = 'directoryChannels',
	ForumChannel = 'forumChannel',
	ForumChannels = 'forumChannels',
	TextBasedChannel = 'textBasedChannel',
	TextBasedChannels = 'textBasedChannels',
	VoiceBasedChannel = 'voiceBasedChannel',
	VoiceBasedChannels = 'voiceBasedChannels',
	Role = 'role',
	Roles = 'roles',
	Emoji = 'emoji',
	Emojis = 'emojis',
	Guild = 'guild',
	Guilds = 'guilds',
	Message = 'message',
	GuildMessage = 'guildMessage',
	RelevantMessage = 'relevantMessage',
	Invite = 'invite',
	UserMention = 'userMention',
	MemberMention = 'memberMention',
	ChannelMention = 'channelMention',
	RoleMention = 'roleMention',
	EmojiMention = 'emojiMention',
	CommandAlias = 'commandAlias',
	Command = 'command',
	Inhibitor = 'inhibitor',
	Listener = 'listener',
	Task = 'task',
	ContextMenuCommand = 'contextMenuCommand',
	Duration = 'duration',
	contentWithDuration = 'contentWithDuration',
	Permission = 'permission',
	DiscordEmoji = 'discordEmoji',
	RoleWithDuration = 'roleWithDuration',
	AbbreviatedNumber = 'abbreviatedNumber',
	GlobalUser = 'globalUser'
}

export const enum InhibitorReason {
	Client = 'client',
	Bot = 'bot',
	Owner = 'owner',
	SuperUser = 'superUser',
	Guild = 'guild',
	Dm = 'dm',
	AuthorNotFound = 'authorNotFound',
	NotNsfw = 'notNsfw',
	DisabledGuild = 'disabledGuild',
	DisabledGlobal = 'disabledGlobal',
	RoleBlacklist = 'roleBlacklist',
	UserGuildBlacklist = 'userGuildBlacklist',
	UserGlobalBlacklist = 'userGlobalBlacklist',
	RestrictedGuild = 'restrictedGuild',
	ChannelGuildBlacklist = 'channelGuildBlacklist',
	ChannelGlobalBlacklist = 'channelGlobalBlacklist',
	RestrictedChannel = 'restrictedChannel',
	GuildBlacklist = 'guildBlacklist',
	Fatal = 'fatal',
	CannotSend = 'cannotSend',
	GuildUnavailable = 'guildUnavailable'
}

export const enum InhibitorType {
	/**
	 * Run on all messages
	 */
	All = 'all',

	/**
	 * Run on messages not blocked by the built-in inhibitors
	 */
	Pre = 'pre',

	/**
	 * Run on messages that are commands
	 */
	Post = 'post'
}

export const enum CommandHandlerEvent {
	CommandBlocked = 'commandBlocked',
	CommandBreakout = 'commandBreakout',
	CommandCancelled = 'commandCancelled',
	CommandTimeout = 'commandTimeout',
	CommandFinished = 'commandFinished',
	CommandInvalid = 'commandInvalid',
	CommandLocked = 'commandLocked',
	CommandStarted = 'commandStarted',
	Cooldown = 'cooldown',
	Error = 'error',
	InPrompt = 'inPrompt',
	MessageBlocked = 'messageBlocked',
	MessageInvalid = 'messageInvalid',
	MissingPermissions = 'missingPermissions',
	SlashBlocked = 'slashBlocked',
	SlashError = 'slashError',
	SlashFinished = 'slashFinished',
	SlashMissingPermissions = 'slashMissingPermissions',
	SlashNotFound = 'slashNotFound',
	SlashStarted = 'slashStarted',
	SlashOnly = 'slashOnly'
}

export const enum ContextCommandHandlerEvent {
	Error = 'error',
	Finished = 'finished',
	NotFound = 'notFound',
	Started = 'started',
	Blocked = 'blocked'
}

export const enum TanzaniteEvent {
	Ban = 'customBan',
	Block = 'customBlock',
	Kick = 'customKick',
	Mute = 'customMute',
	PunishRoleAdd = 'punishRoleAdd',
	PunishRoleRemove = 'punishRoleRemove',
	Purge = 'customPurge',
	RemoveTimeout = 'customRemoveTimeout',
	Timeout = 'customTimeout',
	Unban = 'customUnban',
	Unblock = 'customUnblock',
	Unmute = 'customUnmute',
	UpdateModlog = 'updateModlog',
	UpdateSettings = 'updateSettings',
	Warn = 'customWarn',
	LevelUpdate = 'levelUpdate',
	Lockdown = 'lockdown',
	Unlockdown = 'unlockdown',
	MassBan = 'massBan',
	MassEvidence = 'massEvidence',
	Button = 'button',
	SelectMenu = 'selectMenu',
	ModalSubmit = 'modal'
}
