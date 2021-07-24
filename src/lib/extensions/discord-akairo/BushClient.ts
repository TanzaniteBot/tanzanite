import chalk from 'chalk';
import { AkairoClient } from 'discord-akairo';
import {
	Guild,
	Intents,
	Message,
	MessageEditOptions,
	MessageOptions,
	MessagePayload,
	ReplyMessageOptions,
	Snowflake,
	Structures
} from 'discord.js';
import * as path from 'path';
import { exit } from 'process';
import readline from 'readline';
import { Sequelize } from 'sequelize';
import { contentWithDurationTypeCaster } from '../../../arguments/contentWithDuration';
import { durationTypeCaster } from '../../../arguments/duration';
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
import { BushButtonInteraction } from '../discord.js/BushButtonInteraction';
import { BushCategoryChannel } from '../discord.js/BushCategoryChannel';
import { BushCommandInteraction } from '../discord.js/BushCommandInteraction';
import { BushDMChannel } from '../discord.js/BushDMChannel';
import { BushGuild } from '../discord.js/BushGuild';
import { BushGuildEmoji } from '../discord.js/BushGuildEmoji';
import { BushGuildMember } from '../discord.js/BushGuildMember';
import { BushMessage } from '../discord.js/BushMessage';
import { BushMessageReaction } from '../discord.js/BushMessageReaction';
import { BushNewsChannel } from '../discord.js/BushNewsChannel';
import { BushPresence } from '../discord.js/BushPresence';
import { BushRole } from '../discord.js/BushRole';
import { BushSelectMenuInteraction } from '../discord.js/BushSelectMenuInteraction';
import { BushStoreChannel } from '../discord.js/BushStoreChannel';
import { BushTextChannel } from '../discord.js/BushTextChannel';
import { BushThreadChannel } from '../discord.js/BushThreadChannel';
import { BushThreadMember } from '../discord.js/BushThreadMember';
import { BushUser } from '../discord.js/BushUser';
import { BushVoiceChannel } from '../discord.js/BushVoiceChannel';
import { BushVoiceState } from '../discord.js/BushVoiceState';
import { BushClientUtil } from './BushClientUtil';
import { BushCommandHandler } from './BushCommandHandler';
import { BushInhibitorHandler } from './BushInhibitorHandler';
import { BushListenerHandler } from './BushListenerHandler';
import { BushTaskHandler } from './BushTaskHandler';

export type BushReplyMessageType = string | MessagePayload | ReplyMessageOptions;
export type BushEditMessageType = string | MessageEditOptions | MessagePayload;
export type BushSendMessageType = string | MessagePayload | MessageOptions;
export type BushThreadMemberResolvable = BushThreadMember | BushUserResolvable;
export type BushUserResolvable = BushUser | Snowflake | BushMessage | BushGuildMember | BushThreadMember;
export type BushGuildMemberResolvable = BushGuildMember | BushUserResolvable;
export type BushRoleResolvable = BushRole | Snowflake;

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

export class BushClient extends AkairoClient {
	public static preStart(): void {
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

	public config: Config;
	public listenerHandler: BushListenerHandler;
	public inhibitorHandler: BushInhibitorHandler;
	public commandHandler: BushCommandHandler;
	public taskHandler: BushTaskHandler;
	public declare util: BushClientUtil;
	public declare ownerID: Snowflake[];
	public db: Sequelize;
	public logger: BushLogger;
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
			directory: path.join(__dirname, '..', '..', '..', 'tasks')
		});

		// Create command handler
		this.commandHandler = new BushCommandHandler(this, {
			directory: path.join(__dirname, '..', '..', '..', 'commands'),
			prefix: async ({ guild }: { guild: Guild }) => {
				if (this.config.isDevelopment) return 'dev ';
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
			autoRegisterSlashCommands: true
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
		this.logger = new BushLogger(this);
	}

	get console(): BushLogger {
		return this.logger;
	}

	get consts(): typeof BushConstants {
		return this.constants;
	}

	// Initialize everything
	private async _init(): Promise<void> {
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
			contentWithDuration: contentWithDurationTypeCaster
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
				await this.logger.success('Startup', `Successfully loaded <<${loader}>>.`, false);
			} catch (e) {
				await this.logger.error('Startup', `Unable to load loader <<${loader}>> with error:\n${e?.stack || e}`, false);
			}
		}
		await this.dbPreInit();
		await UpdateCacheTask.init(this);
		this.console.success('Startup', `Successfully created <<cache>>.`, false);
		this.taskHandler.startAll();
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
			await this.console.success('Startup', `Successfully connected to <<database>>.`, false);
		} catch (e) {
			await this.console.error(
				'Startup',
				`Failed to connect to <<database>> with error:\n` + typeof e === 'object' ? e?.stack : e,
				false
			);
		}
	}

	/** Starts the bot */
	public async start(): Promise<void> {
		global.client = this; // makes the client a global object

		try {
			await this._init();
			await this.login(this.token);
		} catch (e) {
			await this.console.error('Start', chalk.red(e?.stack || e), false);
			exit(2);
		}
	}

	/** Logs out, terminates the connection to Discord, and destroys the client. */
	public destroy(relogin = false): void | Promise<string> {
		super.destroy();
		if (relogin) {
			return this.login(this.token);
		}
	}

	public isOwner(user: BushUserResolvable): boolean {
		return this.config.owners.includes(this.users.resolveId(user));
	}
	public isSuperUser(user: BushUserResolvable): boolean {
		const userID = this.users.resolveId(user);
		return !!BushCache?.global?.superUsers?.includes(userID) || this.config.owners.includes(userID);
	}
}
