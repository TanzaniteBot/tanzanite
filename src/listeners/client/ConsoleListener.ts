/* eslint-disable @typescript-eslint/no-unused-vars */
import { BushListener } from '../../lib/extensions/BushListener';
import mongoose from 'mongoose';

export default class ConsoleListener extends BushListener {
	public constructor() {
		super('Console', {
			emitter: 'stdin',
			event: 'line',
			category: 'client'
		});
	}

	public async exec(line: string): Promise<void> {
		const bot = this.client,
			db = mongoose.connection;
		if (line.startsWith('eval ')) {
			try {
				const input = line.replace('eval ', '');
				let output = eval(input);
				output = await output;
				console.log(output);
			} catch (e) {
				console.error(e);
			}
		}		if (line.startsWith('ev ')) {
			try {
				const input = line.replace('ev ', '');
				let output = eval(input);
				output = await output;
				console.log(output);
			} catch (e) {
				console.error(e);
			}
		}else if (line.startsWith('reload')) {
			try {
				this.handler.reloadAll();
				this.client.listenerHandler.reloadAll();
				console.log('Reloaded successfully.');
			} catch (e) {
				console.error(e);
			}
		} else if (line.startsWith('stop') || line.startsWith('exit')) {
			process.exit();
		}
	}
}
