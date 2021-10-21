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
			// args: [
			// 	{
			// 		id: 'fast',
			// 		match: 'flag',
			// 		flag: '--fast'
			// 	}
			// ],
			ownerOnly: true,
			typing: true,
			slash: true,
			// slashOptions: [
			// 	{
			// 		name: 'fast',
			// 		description: 'Whether to use esbuild for fast compiling or not',
			// 		type: 'BOOLEAN',
			// 		required: false
			// 	}
			// ],
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage /* { fast }: { fast: boolean } */): Promise<unknown> {
		if (!message.author.isOwner())
			return await message.util.reply(`${util.emojis.error} Only my developers can run this command.`);

		let output: { stdout: string; stderr: string };
		try {
			const s = new Date();
			output = await util.shell(`yarn build-${/* fast ? 'esbuild' : */ 'tsc'}`);
			await Promise.all([
				client.commandHandler.reloadAll(),
				client.listenerHandler.reloadAll(),
				client.inhibitorHandler.reloadAll(),
				client.contextMenuCommandHandler.reloadAll(),
				client.taskHandler.reloadAll()
			]);

			return message.util.send(`🔁 Successfully reloaded! (${new Date().getTime() - s.getTime()}ms)`);
		} catch (e) {
			if (output!) void client.logger.error('reloadCommand', output);
			return message.util.send(
				`An error occurred while reloading:\n${await util.codeblock(e?.stack || e, 2048 - 34, 'js', true)}`
			);
		}
	}
}
