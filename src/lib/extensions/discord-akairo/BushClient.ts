import type {
	BushApplicationCommand,
	BushBaseGuildEmojiManager,
	BushChannel,
	BushChannelManager,
	BushClientEvents,
	BushClientUser,
	BushGuildManager,
	BushReactionEmoji,
	BushUserManager,
	Config
} from '#lib';
import { patch, type PatchedElements } from '@notenoughupdates/events-intercept';
import * as Sentry from '@sentry/node';
import { AkairoClient, ContextMenuCommandHandler, version as akairoVersion } from 'discord-akairo';
import {
	Intents,
	Options,
	Structures,
	version as discordJsVersion,
	type Awaitable,
	type Collection,
	type DMChannel,
	type InteractionReplyOptions,
	type Message,
	type MessageEditOptions,
	type MessageOptions,
	type MessagePayload,
	type PartialDMChannel,
	type ReplyMessageOptions,
	type Snowflake,
	type WebhookEditMessageOptions
} from 'discord.js';
import path from 'path';
import readline from 'readline';
import type { Sequelize as SequelizeType } from 'sequelize';
import { fileURLToPath } from 'url';
import { abbreviatedNumber } from '../../../arguments/abbreviatedNumber.js';
import { contentWithDuration } from '../../../arguments/contentWithDuration.js';
import { discordEmoji } from '../../../arguments/discordEmoji.js';
import { duration } from '../../../arguments/duration.js';
import { durationSeconds } from '../../../arguments/durationSeconds.js';
import { globalUser } from '../../../arguments/globalUser.js';
import { permission } from '../../../arguments/permission.js';
import { roleWithDuration } from '../../../arguments/roleWithDuration.js';
import { snowflake } from '../../../arguments/snowflake.js';
import UpdateCacheTask from '../../../tasks/updateCache.js';
import UpdateStatsTask from '../../../tasks/updateStats.js';
import { ActivePunishment } from '../../models/ActivePunishment.js';
import { Global } from '../../models/Global.js';
import { Guild as GuildModel } from '../../models/Guild.js';
import { Level } from '../../models/Level.js';
import { ModLog } from '../../models/ModLog.js';
import { Stat } from '../../models/Stat.js';
import { StickyRole } from '../../models/StickyRole.js';
import { AllowedMentions } from '../../utils/AllowedMentions.js';
import { BushCache } from '../../utils/BushCache.js';
import { BushConstants } from '../../utils/BushConstants.js';
import { BushLogger } from '../../utils/BushLogger.js';
import { BushButtonInteraction } from '../discord.js/BushButtonInteraction.js';
import { BushCategoryChannel } from '../discord.js/BushCategoryChannel.js';
import { BushCommandInteraction } from '../discord.js/BushCommandInteraction.js';
import { BushDMChannel } from '../discord.js/BushDMChannel.js';
import { BushGuild } from '../discord.js/BushGuild.js';
import { BushGuildEmoji } from '../discord.js/BushGuildEmoji.js';
import { BushGuildMember } from '../discord.js/BushGuildMember.js';
import { BushMessage } from '../discord.js/BushMessage.js';
import { BushMessageReaction } from '../discord.js/BushMessageReaction.js';
import { BushNewsChannel } from '../discord.js/BushNewsChannel.js';
import { BushPresence } from '../discord.js/BushPresence.js';
import { BushRole } from '../discord.js/BushRole.js';
import { BushSelectMenuInteraction } from '../discord.js/BushSelectMenuInteraction.js';
import { BushStoreChannel } from '../discord.js/BushStoreChannel.js';
import { BushTextChannel } from '../discord.js/BushTextChannel.js';
import { BushThreadChannel } from '../discord.js/BushThreadChannel.js';
import { BushThreadMember } from '../discord.js/BushThreadMember.js';
import { BushUser } from '../discord.js/BushUser.js';
import { BushVoiceChannel } from '../discord.js/BushVoiceChannel.js';
import { BushVoiceState } from '../discord.js/BushVoiceState.js';
import { BushClientUtil } from './BushClientUtil.js';
import { BushCommandHandler } from './BushCommandHandler.js';
import { BushInhibitorHandler } from './BushInhibitorHandler.js';
import { BushListenerHandler } from './BushListenerHandler.js';
import { BushTaskHandler } from './BushTaskHandler.js';
const { Sequelize } = (await import('sequelize')).default;

export type BushReplyMessageType = string | MessagePayload | ReplyMessageOptions;
export type BushEditMessageType = string | MessageEditOptions | MessagePayload;
export type BushSlashSendMessageType = string | MessagePayload | InteractionReplyOptions;
export type BushSlashEditMessageType = string | MessagePayload | WebhookEditMessageOptions;
export type BushSendMessageType = string | MessagePayload | MessageOptions;
export type BushThreadMemberResolvable = BushThreadMember | BushUserResolvable;
export type BushUserResolvable = BushUser | Snowflake | BushMessage | BushGuildMember | BushThreadMember;
export type BushGuildMemberResolvable = BushGuildMember | BushUserResolvable;
export type BushRoleResolvable = BushRole | Snowflake;
export type BushMessageResolvable = Message | BushMessage | Snowflake;
export type BushEmojiResolvable = Snowflake | BushGuildEmoji | BushReactionEmoji;
export type BushEmojiIdentifierResolvable = string | BushEmojiResolvable;
export type BushThreadChannelResolvable = BushThreadChannel | Snowflake;
export type BushApplicationCommandResolvable = BushApplicationCommand | Snowflake;
export type BushGuildTextChannelResolvable = BushTextChannel | BushNewsChannel | Snowflake;
export type BushChannelResolvable = BushChannel | Snowflake;
export type BushTextBasedChannels = PartialDMChannel | BushDMChannel | BushTextChannel | BushNewsChannel | BushThreadChannel;
export type BushGuildTextBasedChannel = Exclude<BushTextBasedChannels, PartialDMChannel | BushDMChannel | DMChannel>;
export interface BushFetchedThreads {
	threads: Collection<Snowflake, BushThreadChannel>;
	hasMore?: boolean;
}

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

type If<T extends boolean, A, B = null> = T extends true ? A : T extends false ? B : A | B;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class BushClient<Ready extends boolean = boolean> extends AkairoClient<Ready> {
	public declare channels: BushChannelManager;
	public declare readonly emojis: BushBaseGuildEmojiManager;
	public declare guilds: BushGuildManager;
	public declare user: If<Ready, BushClientUser>;
	public declare users: BushUserManager;

	public customReady = false;
	public stats: { cpu: number | undefined; commandsUsed: bigint } = { cpu: undefined, commandsUsed: 0n };
	public config: Config;
	public listenerHandler: BushListenerHandler;
	public inhibitorHandler: BushInhibitorHandler;
	public commandHandler: BushCommandHandler;
	public taskHandler: BushTaskHandler;
	public contextMenuCommandHandler: ContextMenuCommandHandler;
	public declare util: BushClientUtil;
	public declare ownerID: Snowflake[];
	public db: SequelizeType;
	public logger = BushLogger;
	public constants = BushConstants;
	public cache = new BushCache();
	public sentry!: typeof Sentry;

	public constructor(config: Config) {
		super({
			ownerID: config.owners,
			intents: Object.values(Intents.FLAGS).reduce((acc, p) => acc | p, 0),
			presence: {
				activities: [
					{
						name: 'Beep Boop',
						type: 'WATCHING'
					}
				],
				status: 'online'
			},
			http: { api: 'https://canary.discord.com/api' },
			allowedMentions: AllowedMentions.users(), // No everyone or role mentions by default
			makeCache: Options.cacheWithLimits({}),
			failIfNotExists: false
		});
		patch(this);

		this.token = config.token as If<Ready, string, string | null>;
		this.config = config;
		// Create listener handler
		this.listenerHandler = new BushListenerHandler(this, {
			directory: path.join(__dirname, '..', '..', '..', 'listeners'),
			automateCategories: true
		});

		// Create inhibitor handler
		this.inhibitorHandler = new BushInhibitorHandler(this, {
			directory: path.join(__dirname, '..', '..', '..', 'inhibitors'),
			automateCategories: true
		});

		// Create task handler
		this.taskHandler = new BushTaskHandler(this, {
			directory: path.join(__dirname, '..', '..', '..', 'tasks'),
			automateCategories: true
		});

		// Create command handler
		this.commandHandler = new BushCommandHandler(this, {
			directory: path.join(__dirname, '..', '..', '..', 'commands'),
			prefix: async ({ guild }: Message) => {
				if (this.config.isDevelopment) return 'dev ';
				if (!guild) return this.config.prefix;
				const row = await GuildModel.findByPk(guild.id);
				return (row?.prefix ?? this.config.prefix) as string;
			},
			allowMention: true,
			handleEdits: true,
			commandUtil: true,
			commandUtilLifetime: 300_000, // 5 minutes
			argumentDefaults: {
				prompt: {
					start: 'Placeholder argument prompt. If you see this please tell my developers.',
					retry: 'Placeholder failed argument prompt. If you see this please tell my developers.',
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
			automateCategories: false,
			autoRegisterSlashCommands: true,
			skipBuiltInPostInhibitors: true,
			useSlashPermissions: true,
			aliasReplacement: /-/g
		});

		this.contextMenuCommandHandler = new ContextMenuCommandHandler(this, {
			directory: path.join(__dirname, '..', '..', '..', 'context-menu-commands'),
			automateCategories: true
		});

		this.util = new BushClientUtil(this);
		this.db = new Sequelize({
			database: this.config.isDevelopment ? 'bushbot-dev' : this.config.isBeta ? 'bushbot-beta' : 'bushbot',
			username: this.config.db.username,
			password: this.config.db.password,
			dialect: 'postgres',
			host: this.config.db.host,
			port: this.config.db.port,
			logging: this.config.logging.db ? (sql) => this.logger.debug(sql) : false,
			timezone: 'America/New_York'
		});
	}

	get console(): typeof BushLogger {
		return this.logger;
	}

	get consts(): typeof BushConstants {
		return this.constants;
	}

	public static init(): void {
		Structures.extend('GuildEmoji', () => BushGuildEmoji);
		Structures.extend('DMChannel', () => BushDMChannel);
		Structures.extend('TextChannel', () => BushTextChannel);
		Structures.extend('VoiceChannel', () => BushVoiceChannel);
		Structures.extend('CategoryChannel', () => BushCategoryChannel);
		Structures.extend('NewsChannel', () => BushNewsChannel);
		Structures.extend('StoreChannel', () => BushStoreChannel);
		Structures.extend('ThreadChannel', () => BushThreadChannel);
		Structures.extend('GuildMember', () => BushGuildMember);
		Structures.extend('ThreadMember', () => BushThreadMember);
		Structures.extend('Guild', () => BushGuild);
		Structures.extend('Message', () => BushMessage);
		Structures.extend('MessageReaction', () => BushMessageReaction);
		Structures.extend('Presence', () => BushPresence);
		Structures.extend('VoiceState', () => BushVoiceState);
		Structures.extend('Role', () => BushRole);
		Structures.extend('User', () => BushUser);
		Structures.extend('CommandInteraction', () => BushCommandInteraction);
		Structures.extend('ButtonInteraction', () => BushButtonInteraction);
		Structures.extend('SelectMenuInteraction', () => BushSelectMenuInteraction);
	}

	// Initialize everything
	async #init() {
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.ignorePermissions = this.config.owners;
		this.commandHandler.ignoreCooldown = [...new Set([...this.config.owners, ...this.cache.global.superUsers])];
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
		this.commandHandler.resolver.addTypes({
			duration,
			contentWithDuration,
			permission,
			snowflake,
			discordEmoji,
			roleWithDuration,
			abbreviatedNumber,
			durationSeconds,
			globalUser
		});

		this.sentry = Sentry;
		this.sentry.setTag('process', process.pid.toString());
		this.sentry.setTag('discord.js', discordJsVersion);
		this.sentry.setTag('discord-akairo', akairoVersion);
		void this.logger.success('startup', `Successfully connected to <<Sentry>>.`, false);

		// loads all the handlers
		const loaders = {
			commands: this.commandHandler,
			contextMenuCommand: this.contextMenuCommandHandler,
			listeners: this.listenerHandler,
			inhibitors: this.inhibitorHandler,
			tasks: this.taskHandler
		};
		for (const loader in loaders) {
			try {
				await loaders[loader as keyof typeof loaders].loadAll();
				void this.logger.success('startup', `Successfully loaded <<${loader}>>.`, false);
			} catch (e) {
				void this.logger.error('startup', `Unable to load loader <<${loader}>> with error:\n${e?.stack || e}`, false);
			}
		}
		await this.dbPreInit();
		await UpdateCacheTask.init(this);
		void this.console.success('startup', `Successfully created <<cache>>.`, false);
		this.stats.commandsUsed = await UpdateStatsTask.init();
	}

	public async dbPreInit() {
		try {
			await this.db.authenticate();
			Global.initModel(this.db);
			GuildModel.initModel(this.db, this);
			ModLog.initModel(this.db);
			ActivePunishment.initModel(this.db);
			Level.initModel(this.db);
			StickyRole.initModel(this.db);
			Stat.initModel(this.db);
			await this.db.sync({ alter: true }); // Sync all tables to fix everything if updated
			await this.console.success('startup', `Successfully connected to <<database>>.`, false);
		} catch (e) {
			await this.console.error(
				'startup',
				`Failed to connect to <<database>> with error:\n${util.inspect(e, { colors: true, depth: 1 })}`,
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
			await this.guilds.fetch();
			const promises = this.guilds.cache.map((guild) => {
				return guild.members.fetch();
			});
			await Promise.all(promises);
			this.customReady = true;
			return done(null, `intercepted ${arg}`);
		});

		// global objects
		global.client = this;
		global.util = this.util;

		try {
			await this.#init();
			await this.login(this.token!);
		} catch (e) {
			await this.console.error('start', util.inspect(e, { colors: true, depth: 1 }), false);
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

	public override isOwner(user: BushUserResolvable): boolean {
		return this.config.owners.includes(this.users.resolveId(user!)!);
	}
	public override isSuperUser(user: BushUserResolvable): boolean {
		const userID = this.users.resolveId(user)!;
		return !!client.cache?.global?.superUsers?.includes(userID) || this.config.owners.includes(userID);
	}
}

export interface BushClient extends PatchedElements {
	on<K extends keyof BushClientEvents>(event: K, listener: (...args: BushClientEvents[K]) => Awaitable<void>): this;
	on<S extends string | symbol>(event: Exclude<S, keyof BushClientEvents>, listener: (...args: any[]) => Awaitable<void>): this;

	once<K extends keyof BushClientEvents>(event: K, listener: (...args: BushClientEvents[K]) => Awaitable<void>): this;
	once<S extends string | symbol>(event: Exclude<S, keyof BushClientEvents>, listener: (...args: any[]) => Awaitable<void>): this;

	emit<K extends keyof BushClientEvents>(event: K, ...args: BushClientEvents[K]): boolean;
	emit<S extends string | symbol>(event: Exclude<S, keyof BushClientEvents>, ...args: unknown[]): boolean;

	off<K extends keyof BushClientEvents>(event: K, listener: (...args: BushClientEvents[K]) => Awaitable<void>): this;
	off<S extends string | symbol>(event: Exclude<S, keyof BushClientEvents>, listener: (...args: any[]) => Awaitable<void>): this;

	removeAllListeners<K extends keyof BushClientEvents>(event?: K): this;
	removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof BushClientEvents>): this;
}
