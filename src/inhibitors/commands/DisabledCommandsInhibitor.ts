import { BotInhibitor } from '../../extensions/BotInhibitor';
import { Command} from 'discord-akairo';
import { Message} from 'discord.js';

export default class BlacklistInhibitor extends BotInhibitor {
	constructor() {
		super('disabled', {
			reason: 'disabled',
		});
	}

	public exec(message: Message, command: Command | null | undefined): boolean {
		return this.client.disabledCommands.includes(command?.id);
	}
}
