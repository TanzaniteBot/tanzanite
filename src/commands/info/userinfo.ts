import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';

export default class UserinfoCommand extends Command {
    public constructor() {
        super('userinfo', {
            aliases: ['userinfo'],
            category: 'info',
            ratelimit: 4,
            cooldown: 4000,
        });
    };
    public exec(message: Message) {
		message.util.send("you are a user :)")
    };
};