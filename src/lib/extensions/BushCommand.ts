/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArgumentGenerator, ArgumentOptions, ArgumentPromptOptions, Command, CommandOptions } from 'discord-akairo';
import { Snowflake } from 'discord.js';
import { BushClient } from './BushClient';
import { BushCommandHandler } from './BushCommandHandler';
import { BushMessage } from './BushMessage';
import { BushSlashMessage } from './BushSlashMessage';

export interface BushArgumentOptions extends ArgumentOptions {
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

	constructor(id: string, options?: BushCommandOptions) {
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
