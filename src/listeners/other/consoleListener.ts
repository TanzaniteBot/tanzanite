/* eslint-disable @typescript-eslint/no-unused-vars */
import { BushListener } from '../../lib/extensions/BushListener';

export default class ConsoleListener extends BushListener {
	public constructor() {
		super('console', {
			emitter: 'stdin',
			event: 'line'
		});
	}

	public async exec(line: string): Promise<void> {
		const bot = this.client;
		if (line.startsWith('eval ')) {
			try {
				const input = line.replace('eval ', '');
				let output = eval(input);
				output = await output;
				console.log(output);
			} catch (e) {
				console.error(e);
			}
		}
		if (line.startsWith('ev ')) {
			try {
				const input = line.replace('ev ', '');
				let output = eval(input);
				output = await output;
				console.log(output);
			} catch (e) {
				console.error(e);
			}
		} /* else if (line.startsWith('reload')) {
			exec('npx tsc', (error) => {
				if (error) {
					return this.client.console.error('Reload', `Error recompiling, \`${error.message}\``);
				}
				try {
					this.client.commandHandler.reloadAll();
					this.client.listenerHandler.reloadAll();
				} catch (e) {
					return this.client.console.error('Reload', e);
				}
				this.client.console.success('Reload', 'Reloaded successfully.');
			});
		} else if (line.startsWith('stop') || line.startsWith('exit')) {
			process.exit();
		} */
	}
}
