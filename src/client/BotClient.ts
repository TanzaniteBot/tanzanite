import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
import { Message } from 'discord.js';
import { join } from 'path';
import { prefix, owners } from '../config/botoptions';
import { token } from '../config/credentials';
import emojis from '../constants/emojis';
import functions from '../constants/functions';
import colors from '../constants/emojis';
import { MessageMentions } from 'discord.js';

declare module 'discord-akairo' {
    interface AkairoClient {
        commamdHandler: CommandHandler;
        listenerHandler: ListenerHandler;
    }
};

interface BotOptions {
    token: string
	owners: string | string[];
	prefix?: string
};

// custom client shit
export default class BotClient extends AkairoClient {
	public config: BotOptions;

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
			disableMentions: "everyone"
		});
        this.config = {owners, token, prefix};
	};

    // listner handler
    public listenerHandler: ListenerHandler = new ListenerHandler(this, {
        directory: join(__dirname, '..', 'lisneters'),
    })
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
                timeout: 'You took to long the command has been canelled',
                ended: 'You exeeded the maximum amount of tries the command has been cacnelled',
                cancel: 'The command has been cancelled',
                retries: 3,
                time: 3e4
            },
            otherwise: ''
        },
        ignorePermissions: owners,
        ignoreCooldown: owners,
    });

    // initlizes command handlers and shit
    private async _init(): Promise<void> {
        this.commandHandler.useListenerHandler(this.listenerHandler);
        this.listenerHandler.setEmitters({
            commandHandler: this.commandHandler,
            listenerHandler: this.listenerHandler,
            process
        });
        // loads all the shit
		this.commandHandler.loadAll();
		this.listenerHandler.loadAll();
    }

    public async start(): Promise<string> {
        await this._init();
        return this.login(this.config.token);
    };

};