import { Config } from './Config.js';

export default new Config({
	credentials: {
		token: '[TOKEN]',
		betaToken: '[TOKEN]',
		devToken: '[TOKEN]',
		hypixelApiKey: '[API_KEY]',
		wolframAlphaAppId: '[APP_ID]',
		imgurClientId: '[CLIENT_ID]',
		imgurClientSecret: '[CLIENT_SECRET]',
		sentryDsn: 'SENTRY_DSN',
		perspectiveApiKey: '[PERSPECTIVE_API_KEY]'
	},
	environment: 'development',
	owners: [
		'322862723090219008', // IRONM00N
		'487443883127472129', // Tyman
		'311294982898057217' // FeLunar
	],
	prefix: '-',
	channels: {
		log: '1000000000000000',
		error: '1000000000000000',
		dm: '1000000000000000',
		servers: '1000000000000000'
	},
	db: {
		host: 'localhost',
		port: 5432,
		username: '[USER_NAME]',
		password: '[PASSWORD]'
	},
	logging: {
		db: false,
		verbose: false,
		info: true
	},
	supportGuild: {
		id: '812400566235430912',
		invite: 'https://discord.gg/mWtDmq6XcB'
	}
});
