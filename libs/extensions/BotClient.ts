import { AkairoClient, ListenerHandler } from 'discord-akairo';
import { Message } from 'discord.js';
import { join } from 'path';
import fs from 'fs';
import sp from 'synchronized-promise';
import emojis from '../../src/constants/emojis';
import functions from '../../src/constants/functions';
import colors from '../../src/constants/colors';
import { InhibitorHandler } from 'discord-akairo';
import AllowedMentions from './AllowedMentions';
import readline from 'readline';
import { Permissions } from 'discord.js';
import { BotCommandHandler } from './BotCommandHandler';
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false,
});

let token = 'default';
let prefix = '-';
let owners: string | string[] = ['default'];
let superUsers: string | string[] = ['default'];
let errorChannel = 'error channel';
let dmChannel = 'dm logging channel';
let channelBlacklist: string | string[] = ['default'];
let userBlacklist: string | string[] = ['default'];
let roleBlacklist: string | string[] = ['default'];
let roleWhitelist: string | string[] = ['default'];
let autoPublishChannels: string[] = ['default'];
let generalLogChannel = 'general logging channel';

// NOTE: The reason why you have to use js file extensions below is because when this file runs, it will be compiled into all js files, not ts.

if (fs.existsSync(__dirname + '/../config/botoptions.js')) {
	const settings = sp(() => import(__dirname + '/../config/botoptions'))();
	errorChannel = settings.errorChannel;
	dmChannel = settings.dmChannel;
	prefix = settings.prefix;
	owners = settings.owners;
	superUsers = settings.superUsers;
	channelBlacklist = settings.channelBlacklist;
	userBlacklist = settings.userBlacklist;
	roleBlacklist = settings.roleBlacklist;
	roleWhitelist = settings.whitelist;
	autoPublishChannels = settings.autoPublishChannels;
	generalLogChannel = settings.generalLogChannel;
}

if (fs.existsSync(__dirname + '/../config/credentials.js')) {
	const creds = sp(() => import(__dirname + '/../config/credentials'))();
	token = creds.token;
}
interface BotOptions {
	token: string;
	owners: string | string[];
	superUsers: string | string[];
	prefix?: string;
	errorChannel: string;
	dmChannel: string;
	channelBlacklist: string | string[];
	userBlacklist: string | string[];
	roleBlacklist: string | string[];
	roleWhitelist: string | string[];
	autoPublishChannels: string[];
	generalLogChannel: string;
}

// custom client
export default class BotClient extends AkairoClient {
	public config: BotOptions;

	public disabledCommands: string[] = [];

	public consts = {
		...emojis,
		...functions,
		...colors,
	};

	// for bot options
	public constructor() {
		super(
			{
				ownerID: owners,
			},
			{
				allowedMentions: new AllowedMentions().toOject(),
			}
		);
		this.config = {
			owners,
			superUsers,
			token,
			prefix,
			errorChannel,
			dmChannel,
			channelBlacklist,
			userBlacklist,
			roleBlacklist,
			roleWhitelist,
			autoPublishChannels,
			generalLogChannel,
		};
	}

	// listener handler
	public listenerHandler: ListenerHandler = new ListenerHandler(this, {
		directory: join(__dirname, '..', 'listeners'),
	});

	// inhibitor handler
	public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {
		directory: join(__dirname, '..', 'inhibitors'),
		automateCategories: true,
	});

	// command handler
	public commandHandler: BotCommandHandler = new BotCommandHandler(this, {
		directory: join(__dirname, '..', 'commands'),
		prefix: prefix,
		allowMention: true,
		handleEdits: true,
		commandUtil: true,
		commandUtilLifetime: 3e5,
		defaultCooldown: 6e4,
		argumentDefaults: {
			prompt: {
				modifyStart: (_: Message, str: string): string => `${str}\n\n Type \`cancel\` to cancel the command`,
				modifyRetry: (_: Message, str: string): string => `${str}\n\n Type \`cancel\` to cancel the command`,
				timeout: 'You took to long the command has been cancelled',
				ended: 'You exceeded the maximum amount of tries the command has been cancelled',
				cancel: 'The command has been cancelled',
				retries: 3,
				time: 3e4,
			},
			otherwise: '',
		},
		ignorePermissions: owners,
		ignoreCooldown: owners,
	});

	// initializes command handlers and stuff
	private async _init(): Promise<void> {
		this.commandHandler.resolver.addType('permission', (message, phrase) => {
			if (!phrase) return null;
			phrase = phrase.toUpperCase().replace(/ /g, '_'); // Modify to how d.js shows permissions
			if (!Permissions.FLAGS[phrase]) {
				return null;
			} else {
				return phrase;
			}
		});
		this.commandHandler.useListenerHandler(this.listenerHandler);
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			listenerHandler: this.listenerHandler,
			process,
			stdin: rl,
		});
		// loads all the stuff
		const loaders = {
			commands: this.commandHandler,
			listeners: this.listenerHandler,
			inhibitors: this.inhibitorHandler,
		};
		for (const loader of Object.keys(loaders)) {
			try {
				loaders[loader].loadAll();
				console.log('Successfully loaded ' + loader + '.');
			} catch (e) {
				console.error('Unable to load loader ' + loader + ' with error ' + e);
			}
		}
	}

	public async start(): Promise<string> {
		await this._init();
		return this.login(this.config.token);
	}

	public destroy(relogin = true): void {
		super.destroy();
		if (relogin) {
			this.login(this.config.token);
		}
	}
}
