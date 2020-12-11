import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ReloadCommand extends Command {
    public constructor() {
        super('reload', {
            aliases: ['reload'],
            category: 'owner',
            args: [
                {
                    id: 'type',
                    type: 'string',
                    default: 'command',
                },
                {
                    id: 'id',
                    type: 'string',
                }
            ],
            description: {
                content: 'Use the command to reload stuff in the bot',
                usage: 'reload < category | command | inhibitor | listener > <id of whatever thing you want to reload>',
                examples: [
                    'reload module owner',
                    'reload ping'
                ]
            },
            ratelimit: 4,
            cooldown: 4000,
            ownerOnly: true,
        });
    };
    public exec(message: Message, { type, id }: {type:String, id:String}) {
        Command.reload(id, sads)
        message.util.send(`Reloaded ${id} 🔁`)
    };
};