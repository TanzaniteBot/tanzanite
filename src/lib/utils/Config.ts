import { Snowflake } from 'discord.js';

export interface ConfigOptions {
	credentials: { token: string; betaToken: string; devToken: string; hypixelApiKey: string };
	environment: 'production' | 'beta' | 'development';
	owners: Snowflake[];
	prefix: string;
	channels: { log: Snowflake; error: Snowflake; dm: Snowflake };
	db: { host: string; port: number; username: string; password: string };
	logging: { db: boolean; verbose: boolean; info: boolean };
	supportGuild: {id: Snowflake, invite: string}
}

export class Config {
	public credentials: { token: string; betaToken: string; devToken: string; hypixelApiKey: string };
	public environment: 'production' | 'beta' | 'development';
	public owners: Snowflake[];
	public prefix: string;
	public channels: { log: Snowflake; error: Snowflake; dm: Snowflake };
	public db: { host: string; port: number; username: string; password: string };
	public logging: { db: boolean; verbose: boolean; info: boolean };
	public supportGuild: {id: Snowflake, invite: string}

	public constructor(options: ConfigOptions) {
		this.credentials = options.credentials;
		this.environment = options.environment;
		this.owners = options.owners;
		this.prefix = options.prefix;
		this.channels = options.channels;
		this.db = options.db;
		this.logging = options.logging;
		this.supportGuild = options.supportGuild
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
