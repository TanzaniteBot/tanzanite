import chalk from 'chalk';
import { AkairoClient, TaskHandler } from 'discord-akairo';
import { APIMessage, Guild, Intents, Message, MessageOptions, Snowflake, UserResolvable } from 'discord.js';
import * as path from 'path';
import { exit } from 'process';
import readline from 'readline';
import { Sequelize } from 'sequelize';
import * as config from '../../config/options';
import * as Models from '../models';
import AllowedMentions from '../utils/AllowedMentions';
import { BushCache } from '../utils/BushCache';
import { BushLogger } from '../utils/BushLogger';
import { BushClientUtil } from './BushClientUtil';
import { BushCommandHandler } from './BushCommandHandler';
import { BushInhibitorHandler } from './BushInhinitorHandler';
import { BushListenerHandler } from './BushListenerHandler';

export type BotConfig = typeof config;
export type BushMessageType = string | APIMessage | (MessageOptions & { split?: false });

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

export class BushClient extends AkairoClient {
	public config: BotConfig;
	public listenerHandler: BushListenerHandler;
	public inhibitorHandler: BushInhibitorHandler;
	public commandHandler: BushCommandHandler;
	public taskHandler: TaskHandler;
	public declare util: BushClientUtil;
	public declare ownerID: Snowflake[];
	public db: Sequelize;
	public logger: BushLogger;
	constructor(config: BotConfig) {
		super(
			{
				ownerID: config.owners,
				intents: Intents.ALL
			},
			{
				allowedMentions: AllowedMentions.users(), // No everyone or role mentions by default
				intents: Intents.ALL
			}
		);

		// Set token
		this.token = config.credentials.token;

		// Set config
		this.config = config;

		// Create listener handler
		this.listenerHandler = new BushListenerHandler(this, {
			directory: path.join(__dirname, '..', '..', 'listeners'),
			automateCategories: true
		});

		// Create inhibitor handler
		this.inhibitorHandler = new BushInhibitorHandler(this, {
			directory: path.join(__dirname, '..', '..', 'inhibitors'),
			automateCategories: true
		});

		// Create task handler
		this.taskHandler = new TaskHandler(this, {
			directory: path.join(__dirname, '..', '..', 'tasks')
		});

		// Create command handler
		this.commandHandler = new BushCommandHandler(this, {
			directory: path.join(__dirname, '..', '..', 'commands'),
			prefix: async ({ guild }: { guild: Guild }) => {
				if (this.config.dev) return 'dev';
				const row = await Models.Guild.findByPk(guild.id);
				return (row?.prefix || this.config.prefix) as string;
			},
			allowMention: true,
			handleEdits: true,
			commandUtil: true,
			commandUtilLifetime: 3e5,
			argumentDefaults: {
				prompt: {
					start: 'Placeholder argument prompt. If you see this please tell the devs.',
					retry: 'Placeholder failed argument prompt. If you see this please tell the devs.',
					modifyStart: (_: Message, str: string): string => `${str}\n\n Type \`cancel\` to cancel the command`,
					modifyRetry: (_: Message, str: string): string =>
						`${str.replace('{error}', this.util.emojis.error)}\n\n Type \`cancel\` to cancel the command`,
					timeout: 'You took too long the command has been cancelled',
					ended: 'You exceeded the maximum amount of tries the command has been cancelled',
					cancel: 'The command has been cancelled',
					retries: 3,
					time: 3e4
				},
				otherwise: ''
			},
			ignorePermissions: this.config.owners,
			ignoreCooldown: this.config.owners,
			automateCategories: true,
			autoRegisterSlashCommands: true
		});

		this.util = new BushClientUtil(this);
		this.db = new Sequelize(this.config.dev ? 'bushbot-dev' : 'bushbot', this.config.db.username, this.config.db.password, {
			dialect: 'postgres',
			host: this.config.db.host,
			port: this.config.db.port,
			logging: false
		});
		this.logger = new BushLogger(this);
	}

	get console(): BushLogger {
		return this.logger;
	}

	// Initialize everything
	private async _init(): Promise<void> {
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.listenerHandler.setEmitters({
			client: this,
			commandHandler: this.commandHandler,
			listenerHandler: this.listenerHandler,
			inhibitorHandler: this.inhibitorHandler,
			taskHandler: this.taskHandler,
			process,
			stdin: rl,
			gateway: this.ws
		});
		// loads all the handlers
		const loaders = {
			commands: this.commandHandler,
			listeners: this.listenerHandler,
			inhibitors: this.inhibitorHandler,
			tasks: this.taskHandler
		};
		for (const loader of Object.keys(loaders)) {
			try {
				loaders[loader].loadAll();
				this.logger.success('Startup', `Successfully loaded <<${loader}>>.`, false);
			} catch (e) {
				this.logger.error('Startup', `Unable to load loader <<${loader}>> with error:\n${e?.stack}`, false);
			}
		}
		this.taskHandler.startAll();
		await this.dbPreInit();
	}

	public async dbPreInit(): Promise<void> {
		try {
			await this.db.authenticate();
			Models.Guild.initModel(this.db, this);
			Models.Modlog.initModel(this.db);
			Models.Ban.initModel(this.db);
			Models.Level.initModel(this.db);
			await this.db.sync(); // Sync all tables to fix everything if updated
			this.console.success('Startup', `Successfully connected to <<database>>.`, false);
		} catch (error) {
			this.console.error('Startup', `Failed to connect to <<database>> with error:\n` + error, false);
		}
	}

	public async start(): Promise<void> {
		try {
			await this._init();
			await this.login(this.token);
		} catch (e) {
			this.console.error('Start', chalk.red(e.stack), false);
			exit(2);
		}
	}

	public destroy(relogin = false): void | Promise<string> {
		super.destroy();
		if (relogin) {
			return this.login(this.token);
		}
	}

	public isOwner(user: UserResolvable): boolean {
		return this.config.owners.includes(this.users.resolveID(user));
	}
	public isSuperUser(user: UserResolvable): boolean {
		const userID = this.users.resolveID(user);
		return !!BushCache?.superUsers?.includes(userID) || this.config.owners.includes(userID);
	}
}
