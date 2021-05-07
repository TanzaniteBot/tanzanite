import { BotListener } from '../../lib/extensions/BotListener';

export default class CreateSlashCommands extends BotListener {
	constructor() {
		super('createslashcommands', {
			emitter: 'client',
			event: 'ready'
		});
	}
	async exec(): Promise<void> {
		try {
			const enabled = await this.client.application.commands.fetch();
			for (const command of enabled) {
				if (
					!this.client.commandHandler.modules.find(
						(cmd) => cmd.id == command[1].name
					)
				) {
					await this.client.application.commands.delete(command[1].id);
					console.log('deleted', command[1].name);
				}
			}

			for (const cmd of this.client.commandHandler.modules) {
				if (cmd[1].execSlash) {
					const found = enabled.find((i) => i.name == cmd[1].id);

					const slashdata = {
						name: cmd[1].id,
						description: cmd[1].description.content,
						options: cmd[1].options.slashCommandOptions
					};

					if (found?.id) {
						if (slashdata.description !== found.description) {
							await this.client.application.commands.edit(found.id, slashdata);
						}
					} else {
						console.log('enabled', cmd[1].id);
						await this.client.application.commands.create(slashdata);
					}
				}
			}

			return console.log('Slash commands registered');
		} catch (e) {
			console.log(e);
			return console.log('Slash commands not registered, see above error.');
		}
	}
}
