import { Command, AkairoError } from 'discord-akairo';
import { Message } from 'discord.js';
import { exec } from "child_process";

export default class ReloadCommand extends Command {
	public constructor() {
		super('reload', {
			aliases: ['reload'],
			category: 'owner',
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

	*args() {
		const type = yield {
			id: 'type',
			type: ["command", "category", "inhibitor", "all"],
			prompt: {
				start: 'What would you like to reload?',
				retry: 'Invalid input. What would you like to reload?',
				time: 30000
			}
		}
		if (type != "all") {
			const id = yield {
				id: 'id',
				type: 'string',
				prompt: {
					start: `What is the id of the ${type} you would like to reload?`,
					retry: `Invalid input. What is the id of the ${type} you would like to reload?`,
					time: 30000
				}
			}
			return { type, id }
		}
		else return { type }
	}

	public exec(message: Message, { type, id }: { type: string, id: string }) {
		exec('npx tsc', (error, stdout, stderr) => {
			if (error) {
				return message.util.send(`Error recompiling, \`${error.name}\``)
			}
			switch (type) {
				case 'category':
					try {
						this.handler.findCategory(id).reloadAll();
					} catch (e) {
						return message.util.send(e.message);
					}
					break;
				case 'all':
					try {
						this.handler.reloadAll()
					} catch (e) {
						return message.util.send(e.message);
					}
					break;
				case 'command':
					try {
						this.handler.reload(id)
					} catch (e) {
						return message.util.send(e.message);
					}
					break;
				case 'inhibitor':
					try {
						this.handler.inhibitorHandler.reload(id)
					} catch (e) {
						return message.util.send(e.message);
					}
					break;
				default:
					return message.util.send("Wtf how did this happen")
			}
			message.util.send(`Reloaded ${(id == undefined && type == "all") ? "all" : id} 🔁`)
		})
	};
};