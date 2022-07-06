import type { Snowflake } from 'discord.js';

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

	/**
	 * The appropriate discord token for the environment.
	 */
	public get token(): string {
		switch (this.environment) {
			case 'production':
				return this.credentials.token;
			case 'beta':
				return this.credentials.betaToken;
			case 'development':
				return this.credentials.devToken;
		}
	}

	/**
	 * Whether this is the production instance of the bot.
	 */
	public get isProduction(): boolean {
		return this.environment === 'production';
	}

	/**
	 * Whether this is the beta instance of the bot.
	 */
	public get isBeta(): boolean {
		return this.environment === 'beta';
	}

	/**
	 * Whether this is the development instance of the bot.
	 */
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
	sentryDsn: string;
	perspectiveApiKey: string;
}

type Environment = 'production' | 'beta' | 'development';

interface Channels {
	log: Snowflake;
	error: Snowflake;
	dm: Snowflake;
	servers: Snowflake;
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
