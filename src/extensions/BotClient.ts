import { AkairoClient , ListenerHandler, InhibitorHandler, MongooseProvider} from 'discord-akairo';
import { BotCommandHandler } from './BotCommandHandler';
import { DiscordAPIError, Message, MessageAdditions, MessageOptions, Permissions, TextChannel, APIMessageContentResolvable } from 'discord.js';
import AllowedMentions from './AllowedMentions';
import functions from '../constants/functions';
import emojis from '../constants/emojis';
import colors from '../constants/colors';
import sp from 'synchronized-promise';
import readline from 'readline';
import { join }from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { ChannelNotFoundError , ChannelWrongTypeError } from './ChannelErrors';
import { guildSchema, userSchema, globalSchema } from './mongoose';

export type MessageType = APIMessageContentResolvable | (MessageOptions & {split?: false}) | MessageAdditions

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false,
});

let token = 'default';
let MongoDB = 'default';
let defaultPrefix = '-';
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
let hypixelApiKey = 'hypixel api key';

// NOTE: The reason why you have to use js file extensions below is because when this file runs, it will be compiled into all js files, not ts.

if (fs.existsSync(__dirname + '/../config/botoptions.js')) {
	const settings = sp(() => import(__dirname + '/../config/botoptions'))();
	errorChannel = settings.errorChannel;
	dmChannel = settings.dmChannel;
	defaultPrefix = settings.defaultPrefix;
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
	MongoDB = creds.MongoDB;
	hypixelApiKey = creds.hypixelApiKey;

}
interface BotOptions {
	owners: string | string[];
	superUsers: string | string[];
	defaultPrefix?: string;
	errorChannel: string;
	dmChannel: string;
	channelBlacklist: string | string[];
	userBlacklist: string | string[];
	roleBlacklist: string | string[];
	roleWhitelist: string | string[];
	autoPublishChannels: string[];
	generalLogChannel: string;
}
interface BotCredentials {
	token: string;
	MongoDB: string;
	hypixelApiKey: string;
}


// custom client
export default class BotClient extends AkairoClient {
	
	public guildSettings: MongooseProvider;
	public userSettings: MongooseProvider;
	public globalSettings: MongooseProvider;
	
	public config: BotOptions;

	public credentials: BotCredentials;

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
				allowedMentions: new AllowedMentions().toObject(),
			}
		);
		this.guildSettings = new MongooseProvider(guildSchema)
		this.userSettings = new MongooseProvider(userSchema)
		this.globalSettings = new MongooseProvider(globalSchema)
		
		this.config = {
			owners,
			superUsers,
			defaultPrefix,
			errorChannel,
			dmChannel,
			channelBlacklist,
			userBlacklist,
			roleBlacklist,
			roleWhitelist,
			autoPublishChannels,
			generalLogChannel,
		},
		this.credentials = {
			token,
			MongoDB,
			hypixelApiKey,
		}
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
		prefix: (message) => {
			if (message.guild) {
				return this.guildSettings.get(message.guild.id, 'prefix', '-');
			} else {
				return defaultPrefix;
			}
			
		},
		allowMention: true,
		handleEdits: true,
		commandUtil: true,
		commandUtilLifetime: 3e5,
		defaultCooldown: 6e4,
		argumentDefaults: {
			prompt: {
				modifyStart: (_: Message, str: string): string => `${str}\n\n Type \`cancel\` to cancel the command`,
				modifyRetry: (_: Message, str: string): string => `${str}\n\n Type \`cancel\` to cancel the command`,
				timeout: 'You took too long the command has been cancelled',
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

	/**
	 * Logs something to the log channel, or throws an error if channel is not found
	 * @param message - The text to log
	 * @throws ChannelNotFoundError - When the channel is invalid or not accessible
	 * @throws ChannelWrongTypeError - When the channel is not a TextChannel
	 * @returns Promise<Message> - The message sent
	 */
	public async log(message: MessageType): Promise<Message> {
		const cID = this.config.generalLogChannel
		let channel: TextChannel
		try {
			channel = await this.channels.fetch(this.config.generalLogChannel) as TextChannel;
		} catch (e) {
			if (e instanceof DiscordAPIError) {
				throw new ChannelNotFoundError(cID)
			}
		}
		if (!(channel instanceof TextChannel)) {
			throw new ChannelWrongTypeError(cID, TextChannel)
		}
		return await channel.send(message)
	}

	/**
	 * Logs something to the error channel, or throws an error if channel is not found
	 * @param message - The text to log
	 * @throws ChannelNotFoundError - When the channel is invalid or not accessible
	 * @throws ChannelWrongTypeError - When the channel is not a TextChannel
	 * @returns Promise<Message> - The message sent
	 */
	public async error(message: MessageType): Promise<Message> {
		const cID = this.config.errorChannel
		let channel: TextChannel
		try {
			channel = await this.channels.fetch(cID) as TextChannel;
		} catch (e) {
			if (e instanceof DiscordAPIError) {
				throw new ChannelNotFoundError(cID)
			}
		}
		if (!(channel instanceof TextChannel)) {
			throw new ChannelWrongTypeError(cID, TextChannel)
		}
		return await channel.send(message)
	}

	public async DB(): Promise<void> {
		try{
			await mongoose.connect(this.credentials.MongoDB, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false,
				useCreateIndex: true
			});
			console.log('Connected to DB');
		}catch(e){
			console.error(`Unable to load DB with error ${e}`);
		}
	}

	public async start(): Promise<string> {
		await this._init();
		await this.DB();
		await this.guildSettings.init();
		await this.userSettings.init();
		await this.globalSettings.init();
		return this.login(this.credentials.token);
	}

	public destroy(relogin = false): void {
		super.destroy();
		if (relogin) {
			this.login(this.credentials.token);
		}
	}
}
