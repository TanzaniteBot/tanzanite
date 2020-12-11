import { Command, Category } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ReloadCommand extends Command {
    public constructor() {
        super('reload', {
            aliases: ['reload'],
            category: 'owner',
            args: [
                {
                    id: 'type',
                    type: /(?:command|category|inhibitor|listener|all)/i,
                    default: 'command',
                },
                {
                    id: 'id',
					type: 'string',
					default: "null"
                }
            ],
            description: {
                content: 'Use the command to reload stuff in the bot',
                usage: 'reload < category | command | inhibitor | listener | all > <id of whatever thing you want to reload>',
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
    public exec(message: Message, { type, id }: {type:string, id:string}) {
		if (id == "null" && type != 'all') return message.util.send("Must give an id!");
        switch (type) {
			case 'category':
				this.handler.findCategory(id).reloadAll();
				break;
			case 'all':
				this.handler.reloadAll()
				break;
			case 'command':
				this.handler.reload(id)
				break;
			case 'inhibitor':
				this.handler.inhibitorHandler.reload(id)
				break;
			default:
				return message.util.send("Wtf how did this happen")
		}
        message.util.send(`Reloaded ${id} 🔁`)
    };
};