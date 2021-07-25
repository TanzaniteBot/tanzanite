import { Config } from '../lib/utils/Config';

export default new Config({
	credentials: {
		token: '[TOKEN]',
		betaToken: '[TOKEN]',
		devToken: '[TOKEN]',
		hypixelApiKey: '[API_KEY]'
	},
	environment: 'development',
	owners: [
		'322862723090219008', //IRONM00N
		'464970779944157204', //TrashCan
		'487443883127472129' //Tyman
	],
	prefix: '-',
	channels: {
		log: '1000000000000000',
		error: '1000000000000000',
		dm: '1000000000000000'
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
	}
});
