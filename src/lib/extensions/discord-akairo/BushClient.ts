import chalk from 'chalk';
import { AkairoClient, ContextMenuCommandHandler } from 'discord-akairo';
import {
	Collection,
	Intents,
	InteractionReplyOptions,
	Message,
	MessageEditOptions,
	MessageOptions,
	MessagePayload,
	PartialDMChannel,
	ReplyMessageOptions,
	Snowflake,
	Structures,
	WebhookEditMessageOptions
} from 'discord.js';
//@ts-ignore: no typings
import eventsIntercept from 'events-intercept';
import JSON5 from 'json5';
import 'json5/lib/register';
import path from 'path';
import { exit } from 'process';
import readline from 'readline';
import { Sequelize } from 'sequelize';
import { abbreviatedNumberTypeCaster } from '../../../arguments/abbreviatedNumber';
import { contentWithDurationTypeCaster } from '../../../arguments/contentWithDuration';
import { discordEmojiTypeCaster } from '../../../arguments/discordEmoji';
import { durationTypeCaster } from '../../../arguments/duration';
import { permissionTypeCaster } from '../../../arguments/permission';
import { roleWithDurationTypeCaster } from '../../../arguments/roleWithDuation';
import { snowflakeTypeCaster } from '../../../arguments/snowflake';
import { UpdateCacheTask } from '../../../tasks/updateCache';
import { ActivePunishment } from '../../models/ActivePunishment';
import { Global } from '../../models/Global';
import { Guild as GuildModel } from '../../models/Guild';
import { Level } from '../../models/Level';
import { ModLog } from '../../models/ModLog';
import { StickyRole } from '../../models/StickyRole';
import { AllowedMentions } from '../../utils/AllowedMentions';
import { BushCache } from '../../utils/BushCache';
import { BushConstants } from '../../utils/BushConstants';
import { BushLogger } from '../../utils/BushLogger';
import { Config } from '../../utils/Config';
import { BushApplicationCommand } from '../discord.js/BushApplicationCommand';
import { BushBaseGuildEmojiManager } from '../discord.js/BushBaseGuildEmojiManager';
import { BushButtonInteraction } from '../discord.js/BushButtonInteraction';
import { BushCategoryChannel } from '../discord.js/BushCategoryChannel';
import { BushChannel } from '../discord.js/BushChannel';
import { BushChannelManager } from '../discord.js/BushChannelManager';
import { BushClientUser } from '../discord.js/BushClientUser';
import { BushCommandInteraction } from '../discord.js/BushCommandInteraction';
import { BushDMChannel } from '../discord.js/BushDMChannel';
import { BushGuild } from '../discord.js/BushGuild';
import { BushGuildEmoji } from '../discord.js/BushGuildEmoji';
import { BushGuildManager } from '../discord.js/BushGuildManager';
import { BushGuildMember } from '../discord.js/BushGuildMember';
import { BushMessage } from '../discord.js/BushMessage';
import { BushMessageReaction } from '../discord.js/BushMessageReaction';
import { BushNewsChannel } from '../discord.js/BushNewsChannel';
import { BushPresence } from '../discord.js/BushPresence';
import { BushReactionEmoji } from '../discord.js/BushReactionEmoji';
import { BushRole } from '../discord.js/BushRole';
import { BushSelectMenuInteraction } from '../discord.js/BushSelectMenuInteraction';
import { BushStoreChannel } from '../discord.js/BushStoreChannel';
import { BushTextChannel } from '../discord.js/BushTextChannel';
import { BushThreadChannel } from '../discord.js/BushThreadChannel';
import { BushThreadMember } from '../discord.js/BushThreadMember';
import { BushUser } from '../discord.js/BushUser';
import { BushUserManager } from '../discord.js/BushUserManager';
import { BushVoiceChannel } from '../discord.js/BushVoiceChannel';
import { BushVoiceState } from '../discord.js/BushVoiceState';
import { BushClientUtil } from './BushClientUtil';
import { BushCommandHandler } from './BushCommandHandler';
import { BushInhibitorHandler } from './BushInhibitorHandler';
import { BushListenerHandler } from './BushListenerHandler';
import { BushTaskHandler } from './BushTaskHandler';

export type BushReplyMessageType = string | MessagePayload | ReplyMessageOptions;
export type BushEditMessageType = string | MessageEditOptions | MessagePayload;
export type BushSlashSendMessageType = string | MessagePayload | InteractionReplyOptions;
export type BushSlashEditMessageType = string | MessagePayload | WebhookEditMessageOptions;
export type BushSendMessageType = string | MessagePayload | MessageOptions;
export type BushThreadMemberResolvable = BushThreadMember | BushUserResolvable;
export type BushUserResolvable = BushUser | Snowflake | BushMessage | BushGuildMember | BushThreadMember;
export type BushGuildMemberResolvable = BushGuildMember | BushUserResolvable;
export type BushRoleResolvable = BushRole | Snowflake;
export type BushMessageResolvable = BushMessage | Snowflake;
export type BushEmojiResolvable = Snowflake | BushGuildEmoji | BushReactionEmoji;
export type BushEmojiIdentifierResolvable = string | BushEmojiResolvable;
export type BushThreadChannelResolvable = BushThreadChannel | Snowflake;
export type BushApplicationCommandResolvable = BushApplicationCommand | Snowflake;
export type BushGuildTextChannelResolvable = BushTextChannel | BushNewsChannel | Snowflake;
export type BushChannelResolvable = BushChannel | Snowflake;
export type BushTextBasedChannels = PartialDMChannel | BushDMChannel | BushTextChannel | BushNewsChannel | BushThreadChannel;
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

export class BushClient<Ready extends boolean = boolean> extends AkairoClient<Ready> {
	public static preStart(): void {
		global.JSON5 = JSON5;

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

	public declare channels: BushChannelManager;
	public declare readonly emojis: BushBaseGuildEmojiManager;
	public declare guilds: BushGuildManager;
	public declare user: If<Ready, BushClientUser>;
	public declare users: BushUserManager;

	public config: Config;
	public listenerHandler: BushListenerHandler;
	public inhibitorHandler: BushInhibitorHandler;
	public commandHandler: BushCommandHandler;
	public taskHandler: BushTaskHandler;
	public contextMenuCommandHandler: ContextMenuCommandHandler;
	public declare util: BushClientUtil;
	public declare ownerID: Snowflake[];
	public db: Sequelize;
	public logger = BushLogger;
	public constants = BushConstants;
	public cache = BushCache;
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
			allowedMentions: AllowedMentions.users() // No everyone or role mentions by default
		});

		this.token = config.token;
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
			skipBuiltInPostInhibitors: false
		});

		this.contextMenuCommandHandler = new ContextMenuCommandHandler(this, {
			directory: path.join(__dirname, '..', '..', '..', 'context-menu-commands'),
			automateCategories: true
		});

		this.util = new BushClientUtil(this);
		this.db = new Sequelize({
			database: this.config.isDevelopment ? 'bushbot-dev' : 'bushbot',
			username: this.config.db.username,
			password: this.config.db.password,
			dialect: 'postgres',
			host: this.config.db.host,
			port: this.config.db.port,
			logging: this.config.logging.db ? (sql) => this.logger.debug(sql) : false
		});
	}

	get console(): typeof BushLogger {
		return this.logger;
	}

	get consts(): typeof BushConstants {
		return this.constants;
	}

	// Initialize everything
	async #init(): Promise<void> {
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.ignorePermissions = this.config.owners;
		this.commandHandler.ignoreCooldown = this.config.owners.concat(this.cache.global.superUsers);
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
			duration: durationTypeCaster,
			contentWithDuration: contentWithDurationTypeCaster,
			permission: permissionTypeCaster,
			snowflake: snowflakeTypeCaster,
			discordEmoji: discordEmojiTypeCaster,
			roleWithDuration: roleWithDurationTypeCaster,
			abbreviatedNumber: abbreviatedNumberTypeCaster
		});
		// loads all the handlers
		const loaders = {
			commands: this.commandHandler,
			contextMenuCommand: this.contextMenuCommandHandler,
			listeners: this.listenerHandler,
			inhibitors: this.inhibitorHandler,
			tasks: this.taskHandler
		};
		for (const loader of Object.keys(loaders)) {
			try {
				loaders[loader as keyof typeof loaders].loadAll();
				void this.logger.success('startup', `Successfully loaded <<${loader}>>.`, false);
			} catch (e) {
				void this.logger.error('startup', `Unable to load loader <<${loader}>> with error:\n${e?.stack || e}`, false);
			}
		}
		await this.dbPreInit();
		await UpdateCacheTask.init(this);
		void this.console.success('startup', `Successfully created <<cache>>.`, false);
		this.taskHandler.startAll!();
	}

	public async dbPreInit(): Promise<void> {
		try {
			await this.db.authenticate();
			Global.initModel(this.db);
			GuildModel.initModel(this.db, this);
			ModLog.initModel(this.db);
			ActivePunishment.initModel(this.db);
			Level.initModel(this.db);
			StickyRole.initModel(this.db);
			await this.db.sync({ alter: true }); // Sync all tables to fix everything if updated
			await this.console.success('startup', `Successfully connected to <<database>>.`, false);
		} catch (e) {
			await this.console.error(
				'startup',
				`Failed to connect to <<database>> with error:\n${typeof e}` === 'object' ? e?.stack : e,
				false
			);
		}
	}

	/** Starts the bot */
	public async start(): Promise<void> {
		const that = this;
		eventsIntercept.patch(this);
		//@ts-ignore: no typings
		this.intercept('ready', async (arg, done) => {
			const promises = that.guilds.cache.map((guild) => {
				return guild.members.fetch();
			});
			await Promise.all(promises);
			return done(null, `intercepted ${arg}`);
		});

		// global objects
		global.client = this;
		global.util = this.util;

		try {
			await this.#init();
			await this.login(this.token!);
		} catch (e) {
			await this.console.error('start', chalk.red(e?.stack || e), false);
			exit(2);
		}
	}

	/** Logs out, terminates the connection to Discord, and destroys the client. */
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
		return !!BushCache?.global?.superUsers?.includes(userID) || this.config.owners.includes(userID);
	}
}
