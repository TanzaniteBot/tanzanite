import { Command, CommandOptions } from 'discord-akairo';
import { BotClient } from './BotClient';

export class BotCommand extends Command {
	public client: BotClient;
	constructor(id: string, options?: CommandOptions) {
		super(id, options);
		this.options = options;
	}
}
