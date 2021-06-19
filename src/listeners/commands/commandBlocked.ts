import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { BushListener } from '../../lib/extensions/BushListener';

export default class CommandBlockedListener extends BushListener {
	public constructor() {
		super('commandBlocked', {
			emitter: 'commandHandler',
			event: 'commandBlocked'
		});
	}

	public async exec(message: Message, command: Command, reason: string): Promise<void> {
		this.client.console.info(
			'CommandBlocked',
			`<<${message.author.tag}>> tried to run <<${message.util.parsed.command}>> but was blocked because <<${reason}>>.`,
			false
		);

		switch (reason) {
			case 'owner': {
				await message.util.send(`You must be an owner to run command \`${message.util.parsed.command}\``);
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
