import { BotInhibitor } from '../../extensions/BotInhibitor';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class BlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('disabled', {
			reason: 'disabled',
		});
	}

	public async exec(message: Message, command: Command | null | undefined): Promise<boolean> {		
		return await this.client.globalSettings.get(this.client.user.id, 'disabledCommands', undefined).includes(command?.id);
	}
}
