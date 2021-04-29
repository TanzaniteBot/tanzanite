import { BushCommand, PermissionLevel } from '../../lib/extensions/BushCommand';
import { Message } from 'discord.js';
import { exec } from 'child_process';

export default class ReloadCommand extends BushCommand {
	public constructor() {
		super('reload', {
			aliases: ['reload'],
			category: 'dev',
			description: {
				content: 'Use the command to reload stuff in the bot',
				usage: 'reload <category|command|inhibitor|listener|all> [id]',
				examples: ['reload all', 'reload command ping']
			},
			ratelimit: 4,
			cooldown: 4000,
			permissionLevel: PermissionLevel.Owner,
			clientPermissions: ['SEND_MESSAGES']
		});
	}

	*args(): unknown {
		const type = yield {
			id: 'type',
			type: ['command', 'category', 'inhibitor', 'listener', 'all'],
			prompt: {
				start: 'What would you like to reload?',
				retry: '<:error:837123021016924261> Choose a valid option to reload.',
				time: 30000
			}
		};
		if (type != 'all') {
			const id = yield {
				id: 'id',
				type: 'string',
				prompt: {
					start: `What is the id of the ${type} you would like to reload?`,
					retry: `<:error:837123021016924261> Choose a valid ${type} id.`,
					time: 30000
				}
			};
			return { type, id };
		} else return { type };
	}

	public exec(message: Message, { type, id }: { type: string; id: string }): void {
		if (!this.client.config.owners.includes(message.author.id)) {
			message.channel.send('<:error:837123021016924261> Only my owners can use this command.');
			return;
		}
		exec('npx tsc', error => {
			if (error) {
				return message.util.reply(`Error recompiling, \`${error.message}\``);
			}
			switch (type) {
				case 'category':
					try {
						this.handler.findCategory(id).reloadAll();
					} catch (e) {
						return message.util.reply(e.message);
					}
					break;
				case 'all':
					try {
						this.handler.reloadAll();
						this.client.listenerHandler.reloadAll();
					} catch (e) {
						return message.util.reply(e.message);
					}
					break;
				case 'command':
					try {
						this.handler.reload(id);
					} catch (e) {
						return message.util.reply(e.message);
					}
					break;
				case 'inhibitor':
					try {
						this.handler.inhibitorHandler.reload(id);
					} catch (e) {
						return message.util.reply(e.message);
					}
					break;
				case 'listener':
					try {
						this.client.listenerHandler.reload(id);
					} catch (e) {
						return message.util.reply(e.message);
					}
					break;
				default:
					return message.util.reply('Wtf how did this happen');
			}
			message.util.reply(`Reloaded ${id == undefined && type == 'all' ? 'all' : id} 🔁`);
		});
	}
}
