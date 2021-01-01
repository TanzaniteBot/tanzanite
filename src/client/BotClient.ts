import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo'
import { Message } from 'discord.js'
import { join } from 'path'
import fs from 'fs'
import sp from 'synchronized-promise'
import emojis from '../constants/emojis'
import functions from '../constants/functions'
import colors from '../constants/colors'
import { InhibitorHandler } from 'discord-akairo'

let token = 'default'
let prefix = '-'
let owners: string | string[] = [
	'default'
]
let errorChannel = 'error channel'
let dmChannel = 'dm logging channel'
let blacklist: string | string[] = [
	'default'
]
let whitelist: string | string[] = [
	'default'
]
let autoPublishChannels: string[] = [
	'default'
]
let generalLogChannel = 'general logging channel'

// NOTE: The reason why you have to use js file extensions below is because when this file runs, it will be compiled into all js files, not ts.
declare module 'discord-akairo' {
	interface AkairoClient {
		commamdHandler: CommandHandler;
		listenerHandler: ListenerHandler;
	}
}

if (fs.existsSync(__dirname + '/../config/botoptions.js')) {
	const settings = sp(() => import(__dirname + '/../config/botoptions'))()
	errorChannel = settings.errorChannel
	dmChannel = settings.dmChannel
	prefix = settings.prefix
	owners = settings.owners
	blacklist = settings.blacklist
	whitelist = settings.whitelist
	autoPublishChannels = settings.autoPublishChannels
	generalLogChannel = settings.generalLogChannel
}
	
if (fs.existsSync(__dirname + '/../config/credentials.js')) {
	const creds = sp(() => import(__dirname + '/../config/credentials'))()
	token = creds.token
}
interface BotOptions {
	token: string
	owners: string | string[];
	prefix?: string,
	errorChannel: string
	dmChannel: string
	blacklist: string | string[];
	whitelist: string | string[];
	autoPublishChannels: string[];
	generalLogChannel: string
}

// custom client
export default class BotClient extends AkairoClient {
	public config: BotOptions;

	public disabledCommands: string[] = [];

	public consts = {
		...emojis,
		...functions,
		...colors
	};

	// for bot options
	public constructor() {
		super({
			ownerID: owners
		}, {
			disableMentions: 'everyone'
		})
		this.config = { owners, token, prefix, errorChannel, dmChannel, blacklist, whitelist, autoPublishChannels, generalLogChannel }
	}

	// listener handler
	public listenerHandler: ListenerHandler = new ListenerHandler(this, {
		directory: join(__dirname, '..', 'listeners'),
	})

	// inhibitor handler
	public inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {
		directory: join(__dirname, '..', 'inhibitors'),
		automateCategories: true
	});

	// command handler
	public commandHandler: CommandHandler = new CommandHandler(this, {
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
				time: 3e4
			},
			otherwise: ''
		},
		ignorePermissions: owners,
		ignoreCooldown: owners,
	});

	// initializes command handlers and stuff
	private async _init(): Promise<void> {
		this.commandHandler.useListenerHandler(this.listenerHandler)
		this.commandHandler.useInhibitorHandler(this.inhibitorHandler)
		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			listenerHandler: this.listenerHandler,
			process
		})
		// loads all the stuff
		const loaders = {
			'commands': this.commandHandler,		
			'listeners': this.listenerHandler,
			'inhibitors': this.inhibitorHandler
		}
		for (const loader of Object.keys(loaders)) {
			try {
				loaders[loader].loadAll()
				console.log('Successfully loaded ' + loader + '.')
			} catch (e) {
				console.error('Unable to load loader ' + loader + ' with error ' + e)
			}
		}
	}

	public async start(): Promise<string> {
		await this._init()
		return this.login(this.config.token)
	}

}