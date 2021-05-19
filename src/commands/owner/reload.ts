import { BotCommand } from '../../lib/extensions/BotCommand';
import { stripIndent } from 'common-tags';
import { Message } from 'discord.js';
import { CommandInteraction } from 'discord.js';

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

	private async getResponse(): Promise<string> {
		try {
			await this.client.util.shell('yarn rimraf dist/');
			await this.client.util.shell('yarn tsc');
			this.client.commandHandler.reloadAll();
			this.client.listenerHandler.reloadAll();
			this.client.inhibitorHandler.reloadAll();
			return '🔁 Successfully reloaded!';
		} catch (e) {
			return stripIndent`
			An error occured while reloading:
			${await this.client.util.haste(e.stack)}
			`;
		}
	}

	public async exec(message: Message): Promise<void> {
		await message.util.send(await this.getResponse())
	}

	public async execSlash(message: CommandInteraction): Promise<void> {
		await message.reply(await this.getResponse())
	}
}
