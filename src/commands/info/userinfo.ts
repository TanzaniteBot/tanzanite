import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';

export default class ReloadCommand extends Command {
    public constructor() {
        super('user', {
            aliases: ['user'],
            category: 'info',
            ratelimit: 4,
            cooldown: 4000,
        });
    };
    public exec(message: Message) {
		message.util.send("you are a user :)")
    };
};