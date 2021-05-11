import { BotCommand } from '../../lib/extensions/BotCommand';
import { stripIndent } from 'common-tags';
import { BotMessage } from '../../lib/extensions/BotMessage';

export default class ReloadCommand extends BotCommand {
	constructor() {
		super('reload', {
			aliases: ['reload'],
			description: {
				content: 'Reloads the bot',
				usage: 'reload',
				examples: ['reload']
			},
			ownerOnly: true,
			typing: true
		});
	}

	public async exec(message: BotMessage): Promise<void> {
		try {
			await this.client.util.shell('yarn rimraf dist/');
			await this.client.util.shell('yarn tsc');
			this.client.commandHandler.reloadAll();
			this.client.listenerHandler.reloadAll();
			this.client.inhibitorHandler.reloadAll();
			await message.util.send('🔁 Successfully reloaded!');
		} catch (e) {
			await message.util.send(stripIndent`
			An error occured while reloading:
			${await this.client.util.haste(e.stack)}
			`);
		}
	}
}
