import { BotListener } from '../../lib/extensions/BotListener';

export default class CreateSlashCommands extends BotListener {
	constructor() {
		super('createslashcommands', {
			emitter: 'client',
			event: 'ready'
		});
	}
	async exec(): Promise<void> {
		await this.client.util.syncSlashCommands();
	}
}
