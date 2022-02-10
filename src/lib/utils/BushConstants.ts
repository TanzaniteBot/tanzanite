import { Colors } from 'discord.js';
import { BushClientUtil } from '../extensions/discord-akairo/BushClientUtil.js';

const rawCapeUrl = 'https://raw.githubusercontent.com/NotEnoughUpdates/capes/master/';

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

export class BushConstants {
	public static emojis = Object.freeze({
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

	public static emojisRaw = Object.freeze({
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

	public static colors = Object.freeze({
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
	public static timeUnits = BushClientUtil.deepFreeze({
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

	public static regex = BushClientUtil.deepFreeze({
		snowflake: /^\d{15,21}$/im,

		discordEmoji: /<a?:(?<name>[a-zA-Z0-9_]+):(?<id>\d{15,21})>/im,

		//stolen from geek
		messageLink:
			/(?:ptb\.|canary\.|staging\.|lc\.)?(?:discord(?:app)?)\.(?:com)?\/channels\/(?<guild_id>\d{15,21}|@me)\/(?<channel_id>\d{15,21})\/(?<message_id>\d{15,21})/im
	} as const);

	/**
	 * Maps the response from pronoundb.org to a readable format
	 */
	public static pronounMapping = Object.freeze({
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
	public static mappings = BushClientUtil.deepFreeze({
		guilds: {
			bush: '516977525906341928',
			tree: '767448775450820639',
			staff: '784597260465995796',
			space_ship: '717176538717749358',
			sbr: '839287012409999391'
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
			ModerateMembers: { name: 'Timeout Members', important: true }
		},

		// prettier-ignore
		features: {
			VERIFIED: { name: 'Verified', important: true, emoji: '<:verified:850795049817473066>', weight: 0 },
			PARTNERED: { name: 'Partnered', important: true, emoji: '<:partneredServer:850794851955507240>', weight: 1 },
			MORE_STICKERS: { name: 'More Stickers', important: true, emoji: null, weight: 2 },
			MORE_EMOJI: { name: 'More Emoji', important: true, emoji: '<:moreEmoji:850786853497602080>', weight: 3 },
			FEATURABLE: { name: 'Featurable', important: true, emoji: '<:featurable:850786776372084756>', weight: 4 },
			RELAY_ENABLED: { name: 'Relay Enabled', important: true, emoji: '<:relayEnabled:850790531441229834>', weight: 5 },
			DISCOVERABLE: { name: 'Discoverable', important: true, emoji: '<:discoverable:850786735360966656>', weight: 6 },
			ENABLED_DISCOVERABLE_BEFORE: { name: 'Enabled Discovery Before', important: false, emoji: '<:enabledDiscoverableBefore:850786754670624828>', weight: 7 },
			MONETIZATION_ENABLED: { name: 'Monetization Enabled', important: true, emoji: null, weight: 8 },
			TICKETED_EVENTS_ENABLED: { name: 'Ticketed Events Enabled', important: true, emoji: null, weight: 9 },
			PREVIEW_ENABLED: { name: 'Preview Enabled', important: true, emoji: '<:previewEnabled:850790508266913823>', weight: 10 },
			COMMERCE: { name: 'Store Channels', important: true, emoji: '<:storeChannels:850786692432396338>', weight: 11 },
			VANITY_URL: { name: 'Vanity URL', important: false, emoji: '<:vanityURL:850790553079644160>', weight: 12 },
			VIP_REGIONS: { name: 'VIP Regions', important: false, emoji: '<:VIPRegions:850794697496854538>', weight: 13 },
			ANIMATED_ICON: { name: 'Animated Icon', important: false, emoji: '<:animatedIcon:850774498071412746>', weight: 14 },
			BANNER: { name: 'Banner', important: false, emoji: '<:banner:850786673150787614>', weight: 15 },
			INVITE_SPLASH: { name: 'Invite Splash', important: false, emoji: '<:inviteSplash:850786798246559754>', weight: 16 },
			PRIVATE_THREADS: { name: 'Private Threads', important: false, emoji: '<:privateThreads:869763711894700093>', weight: 17 },
			THREE_DAY_THREAD_ARCHIVE: { name: 'Three Day Thread Archive', important: false, emoji: '<:threeDayThreadArchive:869767841652564008>', weight: 19 },
			SEVEN_DAY_THREAD_ARCHIVE: { name: 'Seven Day Thread Archive', important: false, emoji: '<:sevenDayThreadArchive:869767896123998288>', weight: 20 },
			ROLE_ICONS: { name: 'Role Icons', important: false, emoji: '<:roleIcons:876993381929222175>', weight: 21 },
			NEWS: { name: 'Announcement Channels', important: false, emoji: '<:announcementChannels:850790491796013067>', weight: 22 },
			MEMBER_VERIFICATION_GATE_ENABLED: { name: 'Membership Verification Gate', important: false, emoji: '<:memberVerificationGateEnabled:850786829984858212>', weight: 23 },
			WELCOME_SCREEN_ENABLED: { name: 'Welcome Screen Enabled', important: false, emoji: '<:welcomeScreenEnabled:850790575875817504>', weight: 24 },
			COMMUNITY: { name: 'Community', important: false, emoji: '<:community:850786714271875094>', weight: 25 },
			THREADS_ENABLED: {name: 'Threads Enabled', important: false, emoji: '<:threadsEnabled:869756035345317919>', weight: 26 },
			THREADS_ENABLED_TESTING: {name: 'Threads Enabled Testing', important: false, emoji: null, weight: 27 },
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
			BushVerified: '<:verfied:853360152090771497>',
			BoostTier1: '<:boostitle:853363736679940127>',
			BoostTier2: '<:boostitle:853363752728789075>',
			BoostTier3: '<:boostitle:853363769132056627>',
			ChannelText: '<:text:853375537791893524>',
			ChannelNews: '<:announcements:853375553531674644>',
			ChannelVoice: '<:voice:853375566735212584>',
			ChannelStage: '<:stage:853375583521210468>',
			ChannelStore: '<:store:853375601175691266>',
			ChannelCategory: '<:category:853375615260819476>',
			ChannelThread: '<:thread:865033845753249813>'
		},

		userFlags: {
			None: '',
			Staff: '<:discordEmployee:848742947826434079>',
			Partner: '<:partneredServerOwner:848743051593777152>',
			Hypesquad: '<:hypeSquadEvents:848743108283072553>',
			BugHunterLevel1: '<:bugHunter:848743239850393640>',
			HypeSquadOnlineHouse1: '<:hypeSquadBravery:848742910563844127>',
			HypeSquadOnlineHouse2: '<:hypeSquadBrilliance:848742840649646101>',
			HypeSquadOnlineHouse3: '<:hypeSquadBalance:848742877537370133>',
			PremiumEarlySupporter: '<:earlySupporter:848741030102171648>',
			TeamPseudoUser: 'TeamPseudoUser',
			BugHunterLevel2: '<:bugHunterGold:848743283080822794>',
			VerifiedBot: '<:verifiedbot_rebrand1:938928232667947028><:verifiedbot_rebrand2:938928355707879475>',
			VerifiedDeveloper: '<:earlyVerifiedBotDeveloper:848741079875846174>',
			CertifiedModerator: '<:discordCertifiedModerator:877224285901582366>',
			BotHTTPInteractions: 'BotHTTPInteractions'
		},

		status: {
			online: '<:online:848937141639577690>',
			idle: '<:idle:848937158261211146>',
			dnd: '<:dnd:848937173780135986>',
			offline: '<:offline:848939387277672448>',
			streaming: '<:streaming:848937187479519242>'
		},

		maybeNitroDiscrims: ['1111', '2222', '3333', '4444', '5555', '6666', '6969', '7777', '8888', '9999'],

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

	public static ArgumentMatches = Object.freeze({
		PHRASE: 'phrase',
		FLAG: 'flag',
		OPTION: 'option',
		REST: 'rest',
		SEPARATE: 'separate',
		TEXT: 'text',
		CONTENT: 'content',
		REST_CONTENT: 'restContent',
		NONE: 'none'
	} as const);

	public static ArgumentTypes = Object.freeze({
		STRING: 'string',
		LOWERCASE: 'lowercase',
		UPPERCASE: 'uppercase',
		CHAR_CODES: 'charCodes',
		NUMBER: 'number',
		INTEGER: 'integer',
		BIGINT: 'bigint',
		EMOJINT: 'emojint',
		URL: 'url',
		DATE: 'date',
		COLOR: 'color',
		USER: 'user',
		USERS: 'users',
		MEMBER: 'member',
		MEMBERS: 'members',
		RELEVANT: 'relevant',
		RELEVANTS: 'relevants',
		CHANNEL: 'channel',
		CHANNELS: 'channels',
		TEXT_CHANNEL: 'textChannel',
		TEXT_CHANNELS: 'textChannels',
		VOICE_CHANNEL: 'voiceChannel',
		VOICE_CHANNELS: 'voiceChannels',
		CATEGORY_CHANNEL: 'categoryChannel',
		CATEGORY_CHANNELS: 'categoryChannels',
		NEWS_CHANNEL: 'newsChannel',
		NEWS_CHANNELS: 'newsChannels',
		STORE_CHANNEL: 'storeChannel',
		STORE_CHANNELS: 'storeChannels',
		STAGE_CHANNEL: 'stageChannel',
		STAGE_CHANNELS: 'stageChannels',
		THREAD_CHANNEL: 'threadChannel',
		THREAD_CHANNELS: 'threadChannels',
		ROLE: 'role',
		ROLES: 'roles',
		EMOJI: 'emoji',
		EMOJIS: 'emojis',
		GUILD: 'guild',
		GUILDS: 'guilds',
		MESSAGE: 'message',
		GUILD_MESSAGE: 'guildMessage',
		RELEVANT_MESSAGE: 'relevantMessage',
		INVITE: 'invite',
		USER_MENTION: 'userMention',
		MEMBER_MENTION: 'memberMention',
		CHANNEL_MENTION: 'channelMention',
		ROLE_MENTION: 'roleMention',
		EMOJI_MENTION: 'emojiMention',
		COMMAND_ALIAS: 'commandAlias',
		COMMAND: 'command',
		INHIBITOR: 'inhibitor',
		LISTENER: 'listener',
		TASK: 'task',
		CONTEXT_MENU_COMMAND: 'contextMenuCommand',
		DURATION: 'duration',
		CONTENT_WITH_DURATION: 'contentWithDuration',
		PERMISSION: 'permission',
		SNOWFLAKE: 'snowflake',
		DISCORD_EMOJI: 'discordEmoji',
		ROLE_WITH_DURATION: 'roleWithDuration',
		ABBREVIATED_NUMBER: 'abbreviatedNumber',
		GLOBAL_USER: 'globalUser'
	} as const);

	public static BlockedReasons = Object.freeze({
		CLIENT: 'client',
		BOT: 'bot',
		OWNER: 'owner',
		SUPER_USER: 'superUser',
		GUILD: 'guild',
		DM: 'dm',
		AUTHOR_NOT_FOUND: 'authorNotFound',
		NOT_NSFW: 'notNsfw',
		DISABLED_GUILD: 'disabledGuild',
		DISABLED_GLOBAL: 'disabledGlobal',
		ROLE_BLACKLIST: 'roleBlacklist',
		USER_GUILD_BLACKLIST: 'userGuildBlacklist',
		USER_GLOBAL_BLACKLIST: 'userGlobalBlacklist',
		RESTRICTED_GUILD: 'restrictedGuild',
		CHANNEL_GUILD_BLACKLIST: 'channelGuildBlacklist',
		CHANNEL_GLOBAL_BLACKLIST: 'channelGlobalBlacklist',
		RESTRICTED_CHANNEL: 'restrictedChannel'
	} as const);

	public static CommandHandlerEvents = Object.freeze({
		COMMAND_BLOCKED: 'commandBlocked',
		COMMAND_BREAKOUT: 'commandBreakout',
		COMMAND_CANCELLED: 'commandCancelled',
		COMMAND_FINISHED: 'commandFinished',
		COMMAND_INVALID: 'commandInvalid',
		COMMAND_LOCKED: 'commandLocked',
		COMMAND_STARTED: 'commandStarted',
		COOLDOWN: 'cooldown',
		ERROR: 'error',
		IN_PROMPT: 'inPrompt',
		MESSAGE_BLOCKED: 'messageBlocked',
		MESSAGE_INVALID: 'messageInvalid',
		MISSING_PERMISSIONS: 'missingPermissions',
		SLASH_BLOCKED: 'slashBlocked',
		SLASH_ERROR: 'slashError',
		SLASH_FINISHED: 'slashFinished',
		SLASH_MISSING_PERMISSIONS: 'slashMissingPermissions',
		SLASH_NOT_FOUND: 'slashNotFound',
		SLASH_STARTED: 'slashStarted',
		SLASH_ONLY: 'slashOnly'
	} as const);

	public static moulberryBushRoleMap = BushClientUtil.deepFreeze([
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
}

export type PronounCode = keyof typeof BushConstants['pronounMapping'];
export type Pronoun = typeof BushConstants['pronounMapping'][PronounCode];
