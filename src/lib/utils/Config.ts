import { Snowflake } from 'discord.js';

export class Config {
	public credentials: Credentials;
	public environment: Environment;
	public owners: Snowflake[];
	public prefix: string;
	public channels: Channels;
	public db: DataBase;
	public logging: Logging;
	public supportGuild: SupportGuild;

	public constructor(options: ConfigOptions) {
		this.credentials = options.credentials;
		this.environment = options.environment;
		this.owners = options.owners;
		this.prefix = options.prefix;
		this.channels = options.channels;
		this.db = options.db;
		this.logging = options.logging;
		this.supportGuild = options.supportGuild;
	}

	public get token(): string {
		return this.environment === 'production'
			? this.credentials.token
			: this.environment === 'beta'
			? this.credentials.betaToken
			: this.credentials.devToken;
	}

	public get isProduction(): boolean {
		return this.environment === 'production';
	}

	public get isBeta(): boolean {
		return this.environment === 'beta';
	}

	public get isDevelopment(): boolean {
		return this.environment === 'development';
	}
}

export interface ConfigOptions {
	credentials: Credentials;
	environment: Environment;
	owners: Snowflake[];
	prefix: string;
	channels: Channels;
	db: DataBase;
	logging: Logging;
	supportGuild: SupportGuild;
}

interface Credentials {
	token: string;
	betaToken: string;
	devToken: string;
	hypixelApiKey: string;
	wolframAlphaAppId: string;
	imgurClientId: string;
	imgurClientSecret: string;
}

type Environment = 'production' | 'beta' | 'development';

interface Channels {
	log: Snowflake;
	error: Snowflake;
	dm: Snowflake;
}

interface DataBase {
	host: string;
	port: number;
	username: string;
	password: string;
}

interface Logging {
	db: boolean;
	verbose: boolean;
	info: boolean;
}

interface SupportGuild {
	id: Snowflake;
	invite: string;
}
