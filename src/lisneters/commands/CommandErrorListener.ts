import { Listener, Command } from 'discord-akairo';
import { MessageEmbed, Message } from 'discord.js';

export default class CommandErrorListener extends Listener {
    public constructor() {
        super('commandError', {
            emitter: 'commandHandler',
            event: 'error',
            category: 'commands'
        });
    }

    public async exec(error: Error, message: Message, command: Command | null | undefined) {
        
	}
};
