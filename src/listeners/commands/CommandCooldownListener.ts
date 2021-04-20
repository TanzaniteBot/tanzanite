import { BushListener } from '../../lib/extensions/BushListener';
import { Command } from 'discord-akairo';
import log from '../../lib/utils/log';
import { Message } from 'discord.js';

export default class CommandCooldownListener extends BushListener {
	public constructor() {
		super('CommandCooldown', {
			emitter: 'commandHandler',
			event: 'cooldown',
			category: 'commands'
		});
	}

	public async exec(message: Message, command: Command | null | undefined, remaining: number): Promise<void> {
		log.info('CommandCooldown', `<<${message.author.tag}>> tried to run <<${message.util.parsed.command}>> but it is on cooldown for <<${remaining / 1000}>> seconds.`);
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		await message.react('⏳').catch(e => {
			console.debug(e);
		});
	}
}
