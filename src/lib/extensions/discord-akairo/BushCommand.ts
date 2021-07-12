/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	ArgumentGenerator,
	ArgumentOptions,
	ArgumentPromptOptions,
	ArgumentTypeCaster,
	Command,
	CommandOptions
} from 'discord-akairo';
import { Snowflake } from 'discord.js';
import { BushMessage } from '../discord.js/BushMessage';
import { BushClient } from './BushClient';
import { BushCommandHandler } from './BushCommandHandler';
import { BushSlashMessage } from './BushSlashMessage';

type BushArgumentType =
	| 'string'
	| 'lowercase'
	| 'uppercase'
	| 'charCodes'
	| 'number'
	| 'integer'
	| 'bigint'
	| 'emojint'
	| 'url'
	| 'date'
	| 'color'
	| 'user'
	| 'users'
	| 'member'
	| 'members'
	| 'relevant'
	| 'relevants'
	| 'channel'
	| 'channels'
	| 'textChannel'
	| 'textChannels'
	| 'voiceChannel'
	| 'voiceChannels'
	| 'categoryChannel'
	| 'categoryChannels'
	| 'newsChannel'
	| 'newsChannels'
	| 'storeChannel'
	| 'storeChannels'
	| 'role'
	| 'roles'
	| 'emoji'
	| 'emojis'
	| 'guild'
	| 'guilds'
	| 'message'
	| 'guildMessage'
	| 'relevantMessage'
	| 'invite'
	| 'userMention'
	| 'memberMention'
	| 'channelMention'
	| 'roleMention'
	| 'emojiMention'
	| 'commandAlias'
	| 'command'
	| 'inhibitor'
	| 'listener'
	| 'duration'
	| (string | string[])[]
	| RegExp
	| string;

export interface BushArgumentOptions extends ArgumentOptions {
	type?: BushArgumentType | ArgumentTypeCaster;
	id: string;
	description?: string;
	prompt?: ArgumentPromptOptions;
}

export interface BushCommandOptions extends CommandOptions {
	hidden?: boolean;
	restrictedChannels?: Snowflake[];
	restrictedGuilds?: Snowflake[];
	description: {
		content: string;
		usage: string | string[];
		examples: string | string[];
	};
	args?: BushArgumentOptions[] | ArgumentGenerator;
	category: string;
}

export class BushCommand extends Command {
	public declare client: BushClient;

	public declare handler: BushCommandHandler;

	public options: BushCommandOptions;

	/** The channels the command is limited to run in. */
	public restrictedChannels: Snowflake[];

	/** The guilds the command is limited to run in. */
	public restrictedGuilds: Snowflake[];

	/** Whether the command is hidden from the help command. */
	public hidden: boolean;

	public constructor(id: string, options?: BushCommandOptions) {
		super(id, options);
		this.options = options;
		this.hidden = options.hidden || false;
		this.restrictedChannels = options.restrictedChannels;
		this.restrictedGuilds = options.restrictedGuilds;
	}

	public exec(message: BushMessage, args: any): any;
	public exec(message: BushMessage | BushSlashMessage, args: any): any {
		super.exec(message, args);
	}
}
