import { Command, CommandOptions } from 'discord-akairo';
import { APIApplicationCommandOption } from 'discord-api-types';
import { BushClient } from './BushClient';

export interface BushCommandOptions extends CommandOptions {
	slashCommandOptions?: APIApplicationCommandOption[];
	description: {
		content: string;
		usage: string;
		examples: string[];
	};
}

export class BushCommand extends Command {
	public client: BushClient;
	constructor(id: string, options?: BushCommandOptions) {
		super(id, options);
		this.options = options;
	}
}
