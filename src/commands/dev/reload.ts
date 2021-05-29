import { BushCommand } from '../../lib/extensions/BushCommand';
import { stripIndent } from 'common-tags';
import { Message } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { SlashCommandOption } from '../../lib/extensions/Util';
import { ApplicationCommandOptionType } from 'discord-api-types';

export default class ReloadCommand extends BushCommand {
	constructor() {
		super('reload', {
			aliases: ['reload'],
			category: 'dev',
			description: {
				content: 'Reloads the bot',
				usage: 'reload',
				examples: ['reload']
			},
			args: [
				{
					id: 'fast',
					match: 'flag',
					flag: '--fast'
				}
			],
			ownerOnly: true,
			typing: true,
			slashCommandOptions: [
				{
					type: ApplicationCommandOptionType.BOOLEAN,
					name: 'fast',
					description: 'Wheather to use esbuild for fast compiling or not',
					required: false
				}
			]
		});
	}

	private async getResponse(fast: boolean): Promise<string> {
		try {
			const s = new Date();
			await this.client.util.shell(`yarn build-${fast ? 'esbuild' : 'tsc'}`);
			this.client.commandHandler.reloadAll();
			this.client.listenerHandler.reloadAll();
			this.client.inhibitorHandler.reloadAll();
			return `🔁 Successfully reloaded! (${
				new Date().getTime() - s.getTime()
			}ms)`;
		} catch (e) {
			return stripIndent`
			An error occured while reloading:
			${await this.client.util.haste(e.stack)}
			`;
		}
	}

	public async exec(
		message: Message,
		{ fast }: { fast: boolean }
	): Promise<void> {
		await message.util.send(await this.getResponse(fast));
	}

	public async execSlash(
		message: CommandInteraction,
		{ fast }: { fast: SlashCommandOption<boolean> }
	): Promise<void> {
		await message.reply(await this.getResponse(fast?.value));
	}
}
