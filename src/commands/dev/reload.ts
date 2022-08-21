import { BushCommand, clientSendAndPermCheck, emojis, formatError, shell, type CommandMessage, type SlashMessage } from '#lib';

export default class ReloadCommand extends BushCommand {
	public constructor() {
		super('reload', {
			aliases: ['reload'],
			category: 'dev',
			description: 'Reloads the bot',
			usage: ['reload'],
			examples: ['reload'],
			ownerOnly: true,
			typing: true,
			slash: true,
			clientPermissions: (m) => clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		if (!message.author.isOwner()) return await message.util.reply(`${emojis.error} Only my developers can run this command.`);

		let output: { stdout: string; stderr: string };
		try {
			const s = new Date();
			output = await shell(`yarn build`);
			await Promise.all([
				this.client.commandHandler.reloadAll(),
				this.client.listenerHandler.reloadAll(),
				this.client.inhibitorHandler.reloadAll(),
				this.client.contextMenuCommandHandler.reloadAll(),
				this.client.taskHandler.reloadAll()
			]);

			return message.util.send(`🔁 Successfully reloaded! (${new Date().getTime() - s.getTime()}ms)`);
		} catch (e) {
			if (output!) void this.client.logger.error('reloadCommand', output);
			return message.util.send(
				`An error occurred while reloading:\n${await this.client.utils.codeblock(formatError(e), 2048 - 34, 'js', true)}`
			);
		}
	}
}
