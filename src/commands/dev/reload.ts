import { BushCommand, BushMessage, BushSlashMessage } from '@lib';

export default class ReloadCommand extends BushCommand {
	public constructor() {
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
			slashOptions: [
				{
					name: 'fast',
					description: 'Whether to use esbuild for fast compiling or not',
					type: 'BOOLEAN',
					required: false
				}
			],
			slash: true
		});
	}

	public async exec(message: BushMessage | BushSlashMessage, { fast }: { fast: boolean }): Promise<unknown> {
		if (!message.author.isOwner())
			return await message.util.reply(`${this.client.util.emojis.error} Only my developers can run this command.`);

		try {
			const s = new Date();
			await this.client.util.shell(`yarn build-${fast ? 'esbuild' : 'tsc'}`);
			this.client.commandHandler.reloadAll();
			this.client.listenerHandler.reloadAll();
			this.client.inhibitorHandler.reloadAll();
			return message.util.send(`🔁 Successfully reloaded! (${new Date().getTime() - s.getTime()}ms)`);
		} catch (e) {
			return message.util.send(
				`An error occurred while reloading:\n${await this.client.util.codeblock(e?.stack || e, 2048 - 34, 'js')}`
			);
		}
	}
}
