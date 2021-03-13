// copy this file remove the 'example_' from the file name
export const defaultPrefix = '-',
	owners = [
		'322862723090219008', //IRONM00N
		'464970779944157204', //TrashCan
		'487443883127472129', //Tyman
	],
	superUsers = [
		'322862723090219008', //IRONM00N
		'464970779944157204', //TrashCan
		'487443883127472129', //Tyman
		'211288288055525376', //Moulberry
		'496409778822709251', //Bestower
	],
	errorChannel = '793285475468443658',
	dmChannel = '793285433932775504',
	channelBlacklist = [
		'793169920908984331', //general
		'714332750156660756', //NEU-Support-1
		'737414807250272258', //NEU-Support-2
	],
	userBlacklist = [
		'526796511309332481', // was spamming commands
		'454615922909380619', // same as above
	],
	roleBlacklist = [
		'803080410418380803', //no beta bot
	],
	roleWhitelist = [
		//these roles override the channel blacklist
		'784600437763997719', //* role
		'746541309853958186', //admin perms
		'737308259823910992', //mod
		'737440116230062091', //helper
	],
	autoPublishChannels = [
		'782464759165354004', //item repo github webhooks
	],
	generalLogChannel = '803081678968848425',
	welcomeChannel = '784597260968656899',
	environment: 'production'|'development' = 'production', 
	verbose = false;