import { Listener, Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ReadyListener extends Listener {
    public constructor() {
        super('commandBlocked', {
            emitter: 'commandHandler',
            event: 'commandBlocked',
            category: 'commands'
        });
    }

    public exec(message: Message, command: Command, reason: string): void {
		switch (reason) {
			case 'owner':
				message.util.send(`You must be an owner to run command \`${message.util.parsed.command}\``)
				break
			default:
				message.util.send(`Command blocked with reason \`${reason}\``)
		}
	}
};