import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ReloadCommand extends Command {
    public constructor() {
        super('botinfo', {
            aliases: ['botinfo'],
            category: 'info',
            ratelimit: 4,
            cooldown: 4000,
        });
    };
    public exec(message: Message) {
        message.util.send('im a bot')
    };
};