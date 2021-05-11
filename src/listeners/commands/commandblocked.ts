import { BotListener } from '../../lib/extensions/BotListener';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class CommandBlockedListener extends BotListener {
	public constructor() {
		super('commandBlocked', {
			emitter: 'commandHandler',
			event: 'commandBlocked'
		});
	}

	public async exec(
		message: Message,
		command: Command,
		reason: string
	): Promise<void> {
		switch (reason) {
			case 'owner': {
				await message.util.send(
					`You must be an owner to run command \`${message.util.parsed.command}\``
				);
				break;
			}
			case 'blacklist': {
				// pass
				break;
			}
			default: {
				await message.util.send(`Command blocked with reason \`${reason}\``);
			}
		}
	}
}
