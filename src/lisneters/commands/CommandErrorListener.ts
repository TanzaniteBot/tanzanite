import { Listener, Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ReadyListener extends Listener {
    public constructor() {
        super('commandError', {
            emitter: 'commandHandler',
            event: 'error',
            category: 'commands'
        });
    }

    public exec(error: Error, message: Message, command: Command | null | undefined) {
        console.log(error)
        message.channel.send(error.message)
	}
};
