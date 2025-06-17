import type { Snowflake } from 'discord.js';

/**
 * Different options for the bot.
 */
export class Config implements ConfigOptions {
	/**
	 * Credentials for various services that the bot depends on.
	 */
	public credentials: Credentials;

	/**
	 * The environment that the bot is operating under.
	 */
	public environment: Environment;

	/**
	 * Bot developers.
	 */
	public owners: Snowflake[];

	/**
	 * A string that needs to come before text commands.
	 */
	public prefix: string;

	/**
	 * Various discord channels that logs will be sent in.
	 */
	public channels: Channels;

	/**
	 * Options for the Postgres database connection.
	 */
	public db: DataBase;

	/**
	 * Options for what events to log.
	 */
	public logging: Logging;

	/**
	 * Information regarding the bot's support server.
	 */
	public supportGuild: SupportGuild;

	/**
	 * @param options The options
	 */
	public constructor(options: ConfigOptions) {
		this.credentials = options.credentials;
		this.environment = options.environment;
		this.owners = options.owners;
		this.prefix = typeof options.prefix === 'string' ? options.prefix : options.prefix[this.environment];
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
			default:
				throw new TypeError(`Unexpected environment: "${this.environment}"`);
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

/**
 * The options to be provided to the {@link Config} class.
 */
export interface ConfigOptions {
	/**
	 * Credentials for various services that the bot depends on.
	 */
	credentials: Credentials;

	/**
	 * The environment that the bot is operating under.
	 */
	environment: Environment;

	/**
	 * Bot developers.
	 */
	owners: Snowflake[];

	/**
	 * A string that needs to come before text commands.
	 */
	prefix: EnvironmentMap<string>;

	/**
	 * Various discord channels that logs will be sent in.
	 */
	channels: Channels;

	/**
	 * Options for the Postgres database connection.
	 */
	db: DataBase;

	/**
	 * Options for what events to log.
	 */
	logging: Logging;

	/**
	 * Information regarding the bot's support server.
	 */
	supportGuild: SupportGuild;
}

/**
 * Credentials for various services that the bot depends on.
 */
export interface Credentials {
	/**
	 * The discord bot token - used when in a 'production' environment.
	 */
	token: string;

	/**
	 * The discord bot token - used when in a 'beta' environment.
	 */
	betaToken: string;

	/**
	 * The discord bot token - used when in a 'development' environment.
	 */
	devToken: string;

	/**
	 * Api Key for the Hypixel Minecraft Java server.
	 * @see {@link https://api.hypixel.net/#section/Authentication/ApiKey}
	 */
	hypixelApiKey: string | null;

	/**
	 * The app id for an API Application for WorlframAlpha
	 * @see {@link https://products.wolframalpha.com/api/}
	 */
	wolframAlphaAppId: string | null;

	/**
	 * The client id for Imgur's API
	 * @see {@link https://apidocs.imgur.com/#authorization-and-oauth}
	 */
	imgurClientId: string | null;

	/**
	 * The client secret for Imgur's API
	 * @see {@link https://apidocs.imgur.com/#authorization-and-oauth}
	 */
	imgurClientSecret: string | null;

	/**
	 * The sentry DSN (Data Source Name) for error reporting
	 * @see {@link https://docs.sentry.io/product/sentry-basics/dsn-explainer/}
	 */
	sentryDsn: string | null;

	/**
	 * The Perspective API Key
	 * @see {@link https://perspectiveapi.com/}
	 */
	perspectiveApiKey: string | null;
}

/**
 * The possible environments that the bot can be running in.
 */
export type Environment = 'production' | 'beta' | 'development';

/**
 * Various discord channels that logs will be sent in.
 */
export type Channels = {
	/**
	 * The id of a channel to send logging messages in,
	 * use an empty string for no channel to be used.
	 */
	// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
	[Key in ConfigChannelKey]: EnvironmentMap<Snowflake | ''>;
};

/**
 * The type of information to be sent in the configured channel.
 */
export type ConfigChannelKey = 'log' | 'warn' | 'error' | 'dm' | 'servers';

/**
 * Options for the Postgres database connection.
 */
export interface DataBase {
	/**
	 * Ex. "tanzanite" would use the databases "tanzanite", "tanzanite-beta", "tanzanite-dev", and "tanzanite-shared".
	 */
	databasePrefix: string;

	/**
	 * The host of the database.
	 */
	host: string;

	/**
	 * The port of the database.
	 */
	port: number;

	/**
	 * The username which is used to authenticate against the database.
	 */
	username: string;

	/**
	 * The password which is used to authenticate against the database.
	 */
	password: string;
}

/**
 * Options for what events to log.
 */
export type Logging = {
	/**
	 * Whether or not to log database queries, verbose logs, or informational logs
	 */
	[Key in LoggingType]: boolean;
} & {
	/**
	 * Override default behavior
	 */
	[Key in OverrideLog]?: boolean;
};

/**
 * The logging level that can be changed.
 */
export type LoggingType = 'db' | 'verbose' | 'info';

/**
 * Override the default logging behavior
 */
export type OverrideLog = 'success' | 'error' | 'warn' | 'veryVerbose' | 'debug' | 'noMessage' | 'noRaw';

/**
 * Information regarding the bot's support server.
 */
export interface SupportGuild {
	/**
	 * The id of the support server.
	 */
	id: Snowflake | null;

	/**
	 * An invite link to the support server.
	 */
	invite: string | null;
}

export type EnvironmentMap<T> = T | { [Key in Environment]: T };
