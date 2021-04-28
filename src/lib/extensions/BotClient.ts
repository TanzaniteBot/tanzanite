import {
	AkairoClient,
	CommandHandler,
	InhibitorHandler,
	ListenerHandler
} from 'discord-akairo';
import { Guild } from 'discord.js';
import * as path from 'path';
import { DataTypes, Model, Sequelize } from 'sequelize';
import * as Models from '../types/Models';
import { BotGuild } from './BotGuild';
import { BotMessage } from './BotMessage';
import { Util } from './Util';
import * as Tasks from '../../tasks';
import { v4 as uuidv4 } from 'uuid';
import { exit } from 'process';
import { TopGGHandler } from '../utils/TopGG';

export interface BotConfig {
	credentials: {
		botToken: string;
		dblToken: string;
		dblWebhookAuth: string;
	};
	owners: string[];
	prefix: string;
	dev: boolean;
	db: {
		username: string;
		password: string;
		host: string;
		port: number;
	};
	topGGPort: number;
	channels: {
		dblVote: string;
		log: string;
		error: string;
		dm: string;
		command: string;
	};
}

export class BotClient extends AkairoClient {
	public config: BotConfig;
	public listenerHandler: ListenerHandler;
	public inhibitorHandler: InhibitorHandler;
	public commandHandler: CommandHandler;
	public topGGHandler: TopGGHandler;
	public util: Util;
	public ownerID: string[];
	public db: Sequelize;
	constructor(config: BotConfig) {
		super(
			{
				ownerID: config.owners
			},
			{
				allowedMentions: { parse: ['users'] } // No everyone or role mentions by default
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
			this.config.dev ? 'utilibot-dev' : 'utilibot',
			this.config.db.username,
			this.config.db.password,
			{
				dialect: 'postgres',
				host: this.config.db.host,
				port: this.config.db.port,
				logging: false
			}
		);
		this.topGGHandler = new TopGGHandler(this);
		BotGuild.install();
		BotMessage.install();
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
			inhibitors: this.inhibitorHandler
		};
		for (const loader of Object.keys(loaders)) {
			try {
				loaders[loader].loadAll();
				console.log('Successfully loaded ' + loader + '.');
			} catch (e) {
				console.error('Unable to load loader ' + loader + ' with error ' + e);
			}
		}
		await this.dbPreInit();
		Object.keys(Tasks).forEach((t) => {
			setInterval(() => Tasks[t](this), 60000);
		});
		this.topGGHandler.init();
	}

	public async dbPreInit(): Promise<void> {
		await this.db.authenticate();
		Models.Guild.init(
			{
				id: {
					type: DataTypes.STRING,
					primaryKey: true
				},
				prefix: {
					type: DataTypes.STRING,
					allowNull: false,
					defaultValue: this.config.prefix
				}
			},
			{ sequelize: this.db }
		);
		Models.Modlog.init(
			{
				id: {
					type: DataTypes.STRING,
					primaryKey: true,
					allowNull: false,
					defaultValue: uuidv4
				},
				type: {
					type: new DataTypes.ENUM(
						'BAN',
						'TEMPBAN',
						'MUTE',
						'TEMPMUTE',
						'KICK',
						'WARN'
					),
					allowNull: false
				},
				user: {
					type: DataTypes.STRING,
					allowNull: false
				},
				moderator: {
					type: DataTypes.STRING,
					allowNull: false
				},
				duration: {
					type: DataTypes.STRING,
					allowNull: true
				},
				reason: {
					type: DataTypes.STRING,
					allowNull: true
				},
				guild: {
					type: DataTypes.STRING,
					references: {
						model: Models.Guild as typeof Model
					}
				}
			},
			{ sequelize: this.db }
		);
		Models.Ban.init(
			{
				id: {
					type: DataTypes.STRING,
					primaryKey: true,
					allowNull: false,
					defaultValue: uuidv4
				},
				user: {
					type: DataTypes.STRING,
					allowNull: false
				},
				guild: {
					type: DataTypes.STRING,
					allowNull: false,
					references: {
						model: Models.Guild as typeof Model,
						key: 'id'
					}
				},
				expires: {
					type: DataTypes.DATE,
					allowNull: true
				},
				reason: {
					type: DataTypes.STRING,
					allowNull: true
				},
				modlog: {
					type: DataTypes.STRING,
					allowNull: false,
					references: {
						model: Models.Modlog as typeof Model
					}
				}
			},
			{ sequelize: this.db }
		);
		try {
			await this.db.sync({ alter: true }); // Sync all tables to fix everything if updated
		} catch {
			// Ignore error
		}
	}

	public async start(): Promise<void> {
		try {
			await this._init();
			await this.login(this.token);
		} catch (e) {
			console.error(e.stack);
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
