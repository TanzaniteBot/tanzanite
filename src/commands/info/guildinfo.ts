import { BotCommand } from "../../extensions/BotCommand";
import { Message } from 'discord.js'

export default class GuildInfoCommand extends BotCommand {
    public constructor() {
    super('guildinfo', {
            aliases: ['guildinfo', 'serverinfo'],
            category: 'info',
            ratelimit: 4,
			cooldown: 4000,
            description: {
                content: 'Use to get info about the server the command was run in',
                usage: 'severinfo',
                examples: ['serverinfo']
            },
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],

        })
    }
    public exec(message: Message) {
        message.channel.send('wip');
    }
}