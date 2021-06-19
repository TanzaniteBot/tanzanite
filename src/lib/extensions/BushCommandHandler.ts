import { CommandHandler, CommandHandlerOptions } from 'discord-akairo';
import { Collection } from 'discord.js';
import { BushClient } from './BushClient';
import { BushCommand } from './BushCommand';

export type BushCommandHandlerOptions = CommandHandlerOptions;

export class BushCommandHandler extends CommandHandler {
	public constructor(client: BushClient, options: BushCommandHandlerOptions) {
		super(client, options);
		this.client = client;
	}

	declare modules: Collection<string, BushCommand>;
}
