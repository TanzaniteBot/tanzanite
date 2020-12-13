import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
import { User, Message } from 'discord.js';
import got, { Got } from 'got/dist/source';
import { join } from 'path';
import { prefix, token, owners } from '../config';

declare module 'discord-akairo' {
    interface AkairoClient {
        commamdHandler: CommandHandler;
        listenerHandler: ListenerHandler;
    }
};

interface BotOptions {
    token?: string
    owners?: string | string[];
};

// custom client shit
export default class BotClient extends AkairoClient {
    public config: BotOptions;
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

    // for bot options
    public constructor(config: BotOptions) {
        super({
            ownerID: config.owners
        });
        this.config = config;
	};

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