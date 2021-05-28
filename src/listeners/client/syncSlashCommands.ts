import { BushListener } from '../../lib/extensions/BushListener';

export default class SyncSlashCommandsListener extends BushListener {
	constructor() {
		super('syncslashcommands', {
			emitter: 'client',
			event: 'ready'
		});
	}
	async exec(): Promise<void> {
		if (this.client.config.dev && this.client.config.devGuild) {
			// Use guild slash commands for instant registration in dev
			await this.client.util.syncSlashCommands(false, this.client.config.devGuild);
		} else {
			// Use global in production
			await this.client.util.syncSlashCommands();
		}
	}
}
