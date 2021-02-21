import { BotInhibitor } from '../../extensions/BotInhibitor';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import functions from '../../constants/functions';

export default class BlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('disabled', {
			reason: 'disabled',
		});
	}

	public async exec(message: Message, command: Command | null | undefined): Promise<boolean> {		
		if (this.client.config.owners.includes(message.author.id)) return false; //Owners Override Disabled commands
		const disabledCommands: string[] = await functions.dbGet('global', 'disabledCommands') as string[];
		if(disabledCommands.includes(command?.id)){
			return true;
		}
		return false
	}
}
