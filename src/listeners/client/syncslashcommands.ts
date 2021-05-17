import chalk from 'chalk';
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
			const registered = await this.client.application.commands.fetch();
			for (const [, registeredCommand] of registered) {
				if (
					!this.client.commandHandler.modules.find(
						(cmd) => cmd.id == registeredCommand.name
					)
				) {
					await this.client.application.commands.delete(registeredCommand.id);
					this.client.logger.verbose(
						`{red Deleted slash command ${registeredCommand.name}}`
					);
				}
			}

			for (const [, botCommand] of this.client.commandHandler.modules) {
				if (botCommand.execSlash) {
					const found = registered.find((i) => i.name == botCommand.id);

					const slashdata = {
						name: botCommand.id,
						description: botCommand.description.content,
						options: botCommand.options.slashCommandOptions
					};

					if (found?.id) {
						if (slashdata.description !== found.description) {
							await this.client.application.commands.edit(found.id, slashdata);
							this.client.logger.verbose(
								`{orange Edited slash command ${botCommand.id}}`
							);
						}
					} else {
						await this.client.application.commands.create(slashdata);
						this.client.logger.verbose(
							`{green Created slash command ${botCommand.id}}`
						);
					}
				}
			}

			return this.client.logger.log(chalk.green('Slash commands registered'));
		} catch (e) {
			console.log(chalk.red(e));
			return this.client.logger.error(
				'{red Slash commands not registered, see above error.}'
			);
		}
	}
}
