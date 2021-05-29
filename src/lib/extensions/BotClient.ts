import {
	AkairoClient,
	CommandHandler,
	InhibitorHandler,
	ListenerHandler,
	TaskHandler
} from 'discord-akairo';
import { Guild } from 'discord.js';
import * as path from 'path';
import { Sequelize } from 'sequelize';
import * as Models from '../models';
import { Util } from './Util';
import { exit } from 'process';
import { Intents } from 'discord.js';
import * as config from '../../config/options';
import { Logger } from '../utils/Logger';
import chalk from 'chalk';

export type BotConfig = typeof config;

export class BotClient extends AkairoClient {
	public config: BotConfig;
	public listenerHandler: ListenerHandler;
	public inhibitorHandler: InhibitorHandler;
	public commandHandler: CommandHandler;
	public taskHandler: TaskHandler;
	public util: Util;
	public ownerID: string[];
	public db: Sequelize;
	public logger: Logger;
	constructor(config: BotConfig) {
		super(
			{
				ownerID: config.owners,
				intents: Intents.NON_PRIVILEGED
			},
			{
				allowedMentions: { parse: ['users'] }, // No everyone or role mentions by default
				intents: Intents.NON_PRIVILEGED
			}
		);

		// Set token
		this.token = config.credentials.botToken;

		// Set config
		this.config = config;

		// Create listener handler
		this.listenerHandler = new ListenerHandler(this, {
			directory: path.join(__dirname, '..', '..', 'listeners'),
			automateCategories: true
		});

		// Create inhibitor handler
		this.inhibitorHandler = new InhibitorHandler(this, {
			directory: path.join(__dirname, '..', '..', 'inhibitors'),
			automateCategories: true
		});

		// Create task handler
		this.taskHandler = new TaskHandler(this, {
			directory: path.join(__dirname, '..', '..', 'tasks')
		});

		// Create command handler
		this.commandHandler = new CommandHandler(this, {
			directory: path.join(__dirname, '..', '..', 'commands'),
			prefix: async ({ guild }: { guild: Guild }) => {
				const row = await Models.Guild.findByPk(guild.id);
				if (!row) return this.config.prefix;
				return row.prefix as string;
			},
			allowMention: true,
			handleEdits: true,
			commandUtil: true,
			commandUtilLifetime: 3e5,
			argumentDefaults: {
				prompt: {
					timeout: 'Timed out.',
					ended: 'Too many tries.',
					cancel: 'Canceled.',
					time: 3e4
				}
			},
			ignorePermissions: this.config.owners,
			ignoreCooldown: this.config.owners,
			automateCategories: true
		});

		this.util = new Util(this);
		this.db = new Sequelize(
			this.config.dev ? 'bushbot-dev' : 'bushbot',
			this.config.db.username,
			this.config.db.password,
			{
				dialect: 'postgres',
				host: this.config.db.host,
				port: this.config.db.port,
				logging: false
			}
		);
		this.logger = new Logger(this);
	}

	// Initialize everything
	private async _init(): Promise<void> {
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			listenerHandler: this.listenerHandler,
			process
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
				this.logger.log(
					chalk.green('Successfully loaded ' + chalk.cyan(loader) + '.')
				);
			} catch (e) {
				console.error(
					chalk.red(
						'Unable to load loader ' + chalk.cyan(loader) + ' with error ' + e
					)
				);
			}
		}
		this.taskHandler.startAll();
		await this.dbPreInit();
	}

	public async dbPreInit(): Promise<void> {
		await this.db.authenticate();
		Models.Guild.initModel(this.db, this);
		Models.Modlog.initModel(this.db);
		Models.Ban.initModel(this.db);
		Models.Level.initModel(this.db);
		await this.db.sync(); // Sync all tables to fix everything if updated
	}

	public async start(): Promise<void> {
		try {
			await this._init();
			await this.login(this.token);
		} catch (e) {
			console.error(chalk.red(e.stack));
			exit(2);
		}
	}

	public destroy(relogin = true): void | Promise<string> {
		super.destroy();
		if (relogin) {
			return this.login(this.token);
		}
	}
}
