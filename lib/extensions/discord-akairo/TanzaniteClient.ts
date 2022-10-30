import {
	abbreviatedNumber,
	contentWithDuration,
	discordEmoji,
	duration,
	durationSeconds,
	globalUser,
	messageLink,
	permission,
	roleWithDuration,
	snowflake
} from '#args';
import type { Config } from '#config';
import { tinyColor } from '#lib/arguments/tinyColor.js';
import { BotCache } from '#lib/common/BotCache.js';
import { HighlightManager } from '#lib/common/HighlightManager.js';
import { AllowedMentions } from '#lib/utils/AllowedMentions.js';
import { BotClientUtils } from '#lib/utils/BotClientUtils.js';
import { emojis } from '#lib/utils/Constants.js';
import { Logger } from '#lib/utils/Logger.js';
import { updateEveryCache } from '#lib/utils/UpdateCache.js';
import { formatError, inspect } from '#lib/utils/Utils.js';
import {
	ActivePunishment,
	Global,
	Guild as GuildModel,
	GuildCount,
	Highlight,
	Level,
	MemberCount,
	ModLog,
	Reminder,
	Shared,
	Stat,
	StickyRole
} from '#models';
import { GlobalFonts } from '@napi-rs/canvas';
import {
	AkairoClient,
	ArgumentTypeCaster,
	ContextMenuCommandHandler,
	version as akairoVersion,
	type ArgumentPromptData,
	type OtherwiseContentSupplier
} from '@notenoughupdates/discord-akairo';
import * as Sentry from '@sentry/node';
import { patch, type PatchedElements } from '@tanzanite/events-intercept';
import {
	ActivityType,
	GatewayIntentBits,
	MessagePayload,
	Options,
	Partials,
	Structures,
	version as discordJsVersion,
	type Awaitable,
	type If,
	type Message,
	type MessageCreateOptions,
	type Snowflake,
	type UserResolvable
} from 'discord.js';
import { google } from 'googleapis';
import { type EventEmitter } from 'node:events';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { Options as SequelizeOptions, Sequelize, Sequelize as SequelizeType } from 'sequelize';
import { BotClientEvents } from '../discord.js/BotClientEvents.js';
import { ExtendedGuild } from '../discord.js/ExtendedGuild.js';
import { ExtendedGuildMember } from '../discord.js/ExtendedGuildMember.js';
import { ExtendedMessage } from '../discord.js/ExtendedMessage.js';
import { ExtendedUser } from '../discord.js/ExtendedUser.js';
import { BotCommandHandler } from './BotCommandHandler.js';
import { BotInhibitorHandler } from './BotInhibitorHandler.js';
import { BotListenerHandler, Emitters } from './BotListenerHandler.js';
import { BotTaskHandler } from './BotTaskHandler.js';

declare module 'discord.js' {
	export interface Client extends EventEmitter {
		/** The ID of the owner(s). */
		ownerID: Snowflake | Snowflake[];
		/** The ID of the superUser(s). */
		superUserID: Snowflake | Snowflake[];
		/** Whether or not the client is ready. */
		customReady: boolean;
		/** The configuration for the client. */
		readonly config: Config;
		/** Stats for the client. */
		readonly stats: BotStats;
		/** The handler for the bot's listeners. */
		readonly listenerHandler: BotListenerHandler;
		/** The handler for the bot's command inhibitors. */
		readonly inhibitorHandler: BotInhibitorHandler;
		/** The handler for the bot's commands. */
		readonly commandHandler: BotCommandHandler;
		/** The handler for the bot's tasks. */
		readonly taskHandler: BotTaskHandler;
		/** The handler for the bot's context menu commands. */
		readonly contextMenuCommandHandler: ContextMenuCommandHandler;
		/** The database connection for this instance of the bot (production, beta, or development). */
		readonly instanceDB: SequelizeType;
		/** The database connection that is shared between all instances of the bot. */
		readonly sharedDB: SequelizeType;
		/** A custom logging system for the bot. */
		readonly logger: Logger;
		/** Cached global and guild database data. */
		readonly cache: BotCache;
		/** Sentry error reporting for the bot. */
		readonly sentry: typeof Sentry;
		/** Manages most aspects of the highlight command */
		readonly highlightManager: HighlightManager;
		/** The perspective api */
		perspective: any;
		/** Client utilities. */
		readonly utils: BotClientUtils;
		/** A custom logging system for the bot. */
		get console(): Logger;
		on<K extends keyof BotClientEvents>(event: K, listener: (...args: BotClientEvents[K]) => Awaitable<void>): this;
		once<K extends keyof BotClientEvents>(event: K, listener: (...args: BotClientEvents[K]) => Awaitable<void>): this;
		emit<K extends keyof BotClientEvents>(event: K, ...args: BotClientEvents[K]): boolean;
		off<K extends keyof BotClientEvents>(event: K, listener: (...args: BotClientEvents[K]) => Awaitable<void>): this;
		removeAllListeners<K extends keyof BotClientEvents>(event?: K): this;
		/**
		 * Checks if a user is the owner of this bot.
		 * @param user - User to check.
		 */
		isOwner(user: UserResolvable): boolean;
		/**
		 * Checks if a user is a super user of this bot.
		 * @param user - User to check.
		 */
		isSuperUser(user: UserResolvable): boolean;
	}
}

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The main hub for interacting with the Discord API.
 */
export class TanzaniteClient<Ready extends boolean = boolean> extends AkairoClient<Ready> {
	public declare ownerID: Snowflake[];
	public declare superUserID: Snowflake[];

	/**
	 * Whether or not the client is ready.
	 */
	public override customReady = false;

	/**
	 * Stats for the client.
	 */
	public override readonly stats: BotStats = { cpu: undefined, commandsUsed: 0n, slashCommandsUsed: 0n };

	/**
	 * The handler for the bot's listeners.
	 */
	public override readonly listenerHandler: BotListenerHandler;

	/**
	 * The handler for the bot's command inhibitors.
	 */
	public override readonly inhibitorHandler: BotInhibitorHandler;

	/**
	 * The handler for the bot's commands.
	 */
	public override readonly commandHandler: BotCommandHandler;

	/**
	 * The handler for the bot's tasks.
	 */
	public override readonly taskHandler: BotTaskHandler;

	/**
	 * The handler for the bot's context menu commands.
	 */
	public override readonly contextMenuCommandHandler: ContextMenuCommandHandler;

	/**
	 * The database connection for this instance of the bot (production, beta, or development).
	 */
	public override readonly instanceDB: SequelizeType;

	/**
	 * The database connection that is shared between all instances of the bot.
	 */
	public override readonly sharedDB: SequelizeType;

	/**
	 * A custom logging system for the bot.
	 */
	public override readonly logger: Logger = new Logger(this);

	/**
	 * Cached global and guild database data.
	 */
	public override readonly cache = new BotCache();

	/**
	 * Sentry error reporting for the bot.
	 */
	public override readonly sentry!: typeof Sentry;

	/**
	 * Manages most aspects of the highlight command
	 */
	public override readonly highlightManager: HighlightManager = new HighlightManager(this);

	/**
	 * The perspective api
	 */
	public override perspective: any;

	/**
	 * Client utilities.
	 */
	public override readonly utils: BotClientUtils = new BotClientUtils(this);

	/**
	 * @param config The configuration for the client.
	 */
	public constructor(
		/**
		 * The configuration for the client.
		 */
		public override readonly config: Config
	) {
		super({
			ownerID: config.owners,
			intents: Object.keys(GatewayIntentBits)
				.map((i) => (typeof i === 'string' ? GatewayIntentBits[i as keyof typeof GatewayIntentBits] : i))
				.reduce((acc, p) => acc | p, 0),
			partials: Object.keys(Partials).map((p) => Partials[p as keyof typeof Partials]),
			presence: {
				activities: [{ name: 'Beep Boop', type: ActivityType.Watching }],
				status: 'online'
			},
			allowedMentions: AllowedMentions.none(), // no mentions by default
			makeCache: Options.cacheWithLimits({
				PresenceManager: {
					maxSize: 0,
					keepOverLimit: (_, key) => {
						if (config.owners.includes(key)) return true;

						return HighlightManager.keep.has(key);
					}
				}
			}),
			failIfNotExists: false,
			rest: { api: 'https://canary.discord.com/api' }
		});
		patch(this);

		this.token = config.token as If<Ready, string, string | null>;

		/* =-=-= handlers =-=-= */
		this.listenerHandler = new BotListenerHandler(this, {
			directory: path.join(__dirname, '../../../src/listeners'),
			extensions: ['.js'],
			automateCategories: true
		});
		this.inhibitorHandler = new BotInhibitorHandler(this, {
			directory: path.join(__dirname, '../../../src/inhibitors'),
			extensions: ['.js'],
			automateCategories: true
		});
		this.taskHandler = new BotTaskHandler(this, {
			directory: path.join(__dirname, '../../../src/tasks'),
			extensions: ['.js'],
			automateCategories: true
		});

		const modify = async (
			message: Message,
			text: string | MessagePayload | MessageCreateOptions | OtherwiseContentSupplier,
			data: ArgumentPromptData,
			replaceError: boolean
		) => {
			const ending = '\n\n Type **cancel** to cancel the command';
			const options = typeof text === 'function' ? await text(message, data) : text;
			const search = '{error}',
				replace = emojis.error;

			if (typeof options === 'string') return (replaceError ? options.replace(search, replace) : options) + ending;

			if (options instanceof MessagePayload) {
				if (options.options.content) {
					if (replaceError) options.options.content = options.options.content.replace(search, replace);
					options.options.content += ending;
				}
			} else if (options.content) {
				if (replaceError) options.content = options.content.replace(search, replace);
				options.content += ending;
			}
			return options;
		};

		this.commandHandler = new BotCommandHandler(this, {
			directory: path.join(__dirname, '../../../src/commands'),
			extensions: ['.js'],
			prefix: async ({ guild }: Message) => {
				if (this.config.isDevelopment) return 'dev ';
				if (!guild) return this.config.prefix;
				const prefix = await guild.getSetting('prefix');
				return (prefix ?? this.config.prefix) as string;
			},
			allowMention: true,
			handleEdits: true,
			commandUtil: true,
			commandUtilLifetime: 300_000, // 5 minutes
			argumentDefaults: {
				prompt: {
					start: 'Placeholder argument prompt. **If you see this please tell my developers**.',
					retry: 'Placeholder failed argument prompt. **If you see this please tell my developers**.',
					modifyStart: (message, text, data) => modify(message, text, data, false),
					modifyRetry: (message, text, data) => modify(message, text, data, true),
					timeout: ':hourglass: You took too long the command has been cancelled.',
					ended: 'You exceeded the maximum amount of tries the command has been cancelled',
					cancel: 'The command has been cancelled',
					retries: 3,
					time: 3e4
				},
				otherwise: ''
			},
			automateCategories: false,
			autoRegisterSlashCommands: true,
			skipBuiltInPostInhibitors: true,
			aliasReplacement: /-/g
		});
		this.contextMenuCommandHandler = new ContextMenuCommandHandler(this, {
			directory: path.join(__dirname, '../../../src/context-menu-commands'),
			extensions: ['.js'],
			automateCategories: true
		});

		/* =-=-= databases =-=-= */
		const sharedDBOptions: SequelizeOptions = {
			username: this.config.db.username,
			password: this.config.db.password,
			dialect: 'postgres',
			host: this.config.db.host,
			port: this.config.db.port,
			logging: this.config.logging.db ? (sql) => this.logger.debug(sql) : false,
			timezone: 'America/New_York'
		};

		const prefix = this.config.db.databasePrefix;

		this.instanceDB = new Sequelize({
			...sharedDBOptions,
			database: this.config.isDevelopment ? `${prefix}-dev` : this.config.isBeta ? `${prefix}-beta` : prefix
		});
		this.sharedDB = new Sequelize({
			...sharedDBOptions,
			database: `${prefix}-shared`
		});

		this.sentry = Sentry;
	}

	/**
	 * A custom logging system for the bot.
	 */
	public override get console(): Logger {
		return this.logger;
	}

	/**
	 * Extends discord.js structures before the client is instantiated.
	 */
	public static extendStructures(): void {
		Structures.extend('GuildMember', () => ExtendedGuildMember);
		Structures.extend('Guild', () => ExtendedGuild);
		Structures.extend('Message', () => ExtendedMessage);
		Structures.extend('User', () => ExtendedUser);
	}

	/**
	 * Initializes the bot.
	 */
	public async init() {
		if (parseInt(process.versions.node.split('.')[0]) < 18) {
			void (await this.console.error('version', `Please use node <<v18.x.x>> or greater, not <<${process.version}>>.`, false));
			process.exit(2);
		}

		this.setMaxListeners(20);

		this.perspective = await google.discoverAPI<any>('https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1');

		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.commandHandler.useTaskHandler(this.taskHandler);
		this.commandHandler.useContextMenuCommandHandler(this.contextMenuCommandHandler);
		this.commandHandler.ignorePermissions = this.config.owners;
		this.commandHandler.ignoreCooldown = [...new Set([...this.config.owners, ...this.cache.shared.superUsers])];
		const emitters: Emitters = {
			client: this,
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler,
			taskHandler: this.taskHandler,
			contextMenuCommandHandler: this.contextMenuCommandHandler,
			process,
			stdin: rl,
			gateway: this.ws,
			rest: this.rest,
			ws: this.ws
		};
		this.listenerHandler.setEmitters(emitters);
		this.commandHandler.resolver.addTypes({
			duration: <ArgumentTypeCaster>duration,
			contentWithDuration: <ArgumentTypeCaster>contentWithDuration,
			permission: <ArgumentTypeCaster>permission,
			snowflake: <ArgumentTypeCaster>snowflake,
			discordEmoji: <ArgumentTypeCaster>discordEmoji,
			roleWithDuration: <ArgumentTypeCaster>roleWithDuration,
			abbreviatedNumber: <ArgumentTypeCaster>abbreviatedNumber,
			durationSeconds: <ArgumentTypeCaster>durationSeconds,
			globalUser: <ArgumentTypeCaster>globalUser,
			messageLink: <ArgumentTypeCaster>messageLink,
			tinyColor: <ArgumentTypeCaster>tinyColor
		});

		this.sentry.setTag('process', process.pid.toString());
		this.sentry.setTag('discord.js', discordJsVersion);
		this.sentry.setTag('discord-akairo', akairoVersion);
		void this.logger.success('startup', `Successfully connected to <<Sentry>>.`, false);

		// loads all the handlers
		const handlers = {
			commands: this.commandHandler,
			contextMenuCommands: this.contextMenuCommandHandler,
			listeners: this.listenerHandler,
			inhibitors: this.inhibitorHandler,
			tasks: this.taskHandler
		};
		const handlerPromises = Object.entries(handlers).map(([handlerName, handler]) =>
			handler
				.loadAll()
				.then(() => {
					void this.logger.success('startup', `Successfully loaded <<${handlerName}>>.`, false);
				})
				.catch((e) => {
					void this.logger.error('startup', `Unable to load loader <<${handlerName}>> with error:\n${formatError(e)}`, false);
					if (process.argv.includes('dry')) process.exit(1);
				})
		);
		await Promise.allSettled(handlerPromises);
	}

	public registerFonts() {
		return GlobalFonts.loadFontsFromDir(path.join(__dirname, '../../../assets/fonts'));
	}

	/**
	 * Connects to the database, initializes models, and creates tables if they do not exist.
	 */
	public async dbPreInit() {
		try {
			await this.instanceDB.authenticate();
			GuildModel.initModel(this.instanceDB, this);
			ModLog.initModel(this.instanceDB);
			ActivePunishment.initModel(this.instanceDB);
			Level.initModel(this.instanceDB);
			StickyRole.initModel(this.instanceDB);
			Reminder.initModel(this.instanceDB);
			Highlight.initModel(this.instanceDB);
			await this.instanceDB.sync({ alter: true }); // Sync all tables to fix everything if updated
			await this.console.success('startup', `Successfully connected to <<instance database>>.`, false);
		} catch (e) {
			await this.console.error(
				'startup',
				`Failed to connect to <<instance database>> with error:\n${inspect(e, { colors: true, depth: 1 })}`,
				false
			);
			process.exit(2);
		}
		try {
			await this.sharedDB.authenticate();
			Stat.initModel(this.sharedDB);
			Global.initModel(this.sharedDB);
			Shared.initModel(this.sharedDB);
			MemberCount.initModel(this.sharedDB);
			GuildCount.initModel(this.sharedDB);
			await this.sharedDB.sync({
				// Sync all tables to fix everything if updated
				// if another instance restarts we don't want to overwrite new changes made in development
				alter: this.config.isDevelopment
			});
			await this.console.success('startup', `Successfully connected to <<shared database>>.`, false);
		} catch (e) {
			await this.console.error(
				'startup',
				`Failed to connect to <<shared database>> with error:\n${inspect(e, { colors: true, depth: 1 })}`,
				false
			);
			process.exit(2);
		}
	}

	/**
	 * Starts the bot
	 */
	public async start() {
		this.intercept('ready', async (arg, done) => {
			const promises = this.guilds.cache
				.filter((g) => g.large)
				.map((guild) => {
					return guild.members.fetch();
				});
			await Promise.all(promises);
			this.customReady = true;
			this.taskHandler.startAll();
			return done(null, `intercepted ${arg}`);
		});

		try {
			await this.highlightManager.syncCache();
			await updateEveryCache(this);
			void this.console.success('startup', `Successfully created <<cache>>.`, false);

			const stats =
				(await Stat.findByPk(this.config.environment)) ?? (await Stat.create({ environment: this.config.environment }));
			this.stats.commandsUsed = stats.commandsUsed;
			this.stats.slashCommandsUsed = stats.slashCommandsUsed;
			await this.login(this.token!);
		} catch (e) {
			await this.console.error('start', inspect(e, { colors: true, depth: 1 }), false);
			process.exit(1);
		}
	}

	/**
	 * Logs out, terminates the connection to Discord, and destroys the client.
	 */
	public override destroy(relogin = false): void | Promise<string> {
		super.destroy();
		if (relogin) {
			return this.login(this.token!);
		}
	}

	public override isOwner(user: UserResolvable): boolean {
		return this.config.owners.includes(this.users.resolveId(user!)!);
	}

	public override isSuperUser(user: UserResolvable): boolean {
		const userID = this.users.resolveId(user)!;
		return this.cache.shared.superUsers.includes(userID) || this.config.owners.includes(userID);
	}
}

export interface TanzaniteClient<Ready extends boolean = boolean> extends EventEmitter, PatchedElements, AkairoClient<Ready> {
	on<K extends keyof BotClientEvents>(event: K, listener: (...args: BotClientEvents[K]) => Awaitable<void>): this;
	once<K extends keyof BotClientEvents>(event: K, listener: (...args: BotClientEvents[K]) => Awaitable<void>): this;
	emit<K extends keyof BotClientEvents>(event: K, ...args: BotClientEvents[K]): boolean;
	off<K extends keyof BotClientEvents>(event: K, listener: (...args: BotClientEvents[K]) => Awaitable<void>): this;
	removeAllListeners<K extends keyof BotClientEvents>(event?: K): this;
}

/**
 * Various statistics
 */
export interface BotStats {
	/**
	 * The average cpu usage of the bot from the past 60 seconds.
	 */
	cpu: number | undefined;

	/**
	 * The total number of times any command has been used.
	 */
	commandsUsed: bigint;

	/**
	 * The total number of times any slash command has been used.
	 */
	slashCommandsUsed: bigint;
}
