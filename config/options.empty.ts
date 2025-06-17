import { Config } from './Config.js';

export default new Config({
	// you only have to set the token you need for your dev environment,
	// the other options can be set to empty strings
	credentials: {
		token: '',
		betaToken: '',
		devToken: '[TOKEN]' /* put token here */,
		hypixelApiKey: null, // set to null if you don't have one
		wolframAlphaAppId: null, // set to null if you don't have one
		imgurClientId: null, // set to null if you don't have one
		imgurClientSecret: null, // set to null if you don't have one
		sentryDsn: null, // set to null if you don't have one
		perspectiveApiKey: null // set to null if you don't have one
	},
	environment: 'development',
	owners: [
		/* put your discord id here */
	],
	prefix: '-' /* when in dev env, the prefix is always "dev " */,
	// set each channel to an id of a valid discord text channel
	// or set them to empty strings to not send any discord logs.
	channels: {
		log: '',
		warn: '',
		error: '',
		dm: '',
		servers: ''
	},
	db: {
		/* You need to have two databases: "{databasePrefix}-dev" & "{databasePrefix}-shared" */
		/* ex: "tanzanite-dev" and "tanzanite-shared" */
		databasePrefix: 'tanzanite',
		host: 'localhost' /* if you want to connect to a remote database change this */,
		port: 5432 /* if you changed what port postgres is using change this */,
		username: '[USER_NAME]' /* put postgres username here */,
		password: '[PASSWORD]' /* put postgres password here */
	},
	logging: {
		db: false,
		verbose: false,
		info: true
	},
	supportGuild: {
		id: null,
		invite: null
	}
});
