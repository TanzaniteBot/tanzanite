import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js'

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
            },
            ownerOnly: true
        });
    };
    public async exec(message: Message) {
        // @ts-ignore
        const url: string = await this.client.consts.haste("text")
        const errorlogembed = new MessageEmbed()
        .setTitle('A error occured')
        .setDescription(`**User:** PLACEHOLDER\n**Command:** PLACEHOLDER\n**Channel:** PLACEHOLDER`)
        .addField('Error', `${url}`)
        .setColor('#1FD8F1')
        .setTimestamp();
        message.util.send(errorlogembed)
    }
};