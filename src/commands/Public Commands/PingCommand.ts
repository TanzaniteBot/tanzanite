import { Argument } from 'discord-akairo';
import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class PingCommand extends Command {
    public constructor() {
        super('ping', {
            aliases: ['pong'],
            description: {
                content: 'Checks the ping of the bot',
                category: 'Public Commands',
                usage: 'ping',
                examples: [
                    'ping'
                ]
            },
            ratelimit: 3
        });
    };

    public exec(message: Message, args: any) {
        return message.util.send('STOP FUCKING PINGING ME BITCH FUCK OFF');
    };
};