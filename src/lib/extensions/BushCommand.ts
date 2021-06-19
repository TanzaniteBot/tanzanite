/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Command, CommandOptions } from 'discord-akairo';
import { APIApplicationCommandOption } from 'discord-api-types';
import { CommandInteraction, Snowflake } from 'discord.js';
import { BushClient } from './BushClient';
import { BushInteractionMessage } from './BushInteractionMessage';
import { BushMessage } from './BushMessage';

export interface BushCommandOptions extends CommandOptions {
	hidden?: boolean;
	restrictedChannels?: Snowflake[];
	restrictedGuilds?: Snowflake[];
	slashCommandOptions?: APIApplicationCommandOption[];
	description: {
		content: string;
		usage: string;
		examples: string[];
	};
}

export class BushCommand extends Command {
	public declare client: BushClient;
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
	// @ts-ignore: They are close enough
	public exec(message: BushMessage | BushInteractionMessage, args: any): any {
		// @ts-ignore: They are close enough
		super.exec(message, args);
	}

	/** Be careful when using this with a slash command since only the interaction is parsed as the message */
	public before(message: BushMessage): any;
	public before(message: BushMessage | CommandInteraction): any;
	public before(message) {
		super.before(message);
	}
}
