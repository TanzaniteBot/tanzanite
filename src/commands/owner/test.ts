import { Command } from 'discord-akairo';
import { Message } from 'discord.js'

export default class TestCommand extends Command {
    public constructor() {
        super('test', {
            aliases: ['test'],
            category: 'owner',
            description: {
                content: 'A command to test shit',
                usage: 'test',
                examples: [
                    'test'
                ]
            }
        });
    };
    public exec(message: Message) {
        message.util.send('https://cdn.discordapp.com/attachments/693586365819912252/785998251639701514/video0.mov')
    }
};