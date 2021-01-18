import { BotListener } from '../../extensions/BotListener';

export default class ConsoleListener extends BotListener {
	public constructor() {
		super('Console', {
			emitter: 'stdin',
			event: 'line',
			category: 'client',
		});
	}

	public exec(line: string): void {
		if (line.startsWith('eval ')) {
			try {
				const input = line.replace('eval ', '');
				const output = eval(input);
				console.log(output);
			} catch (e) {
				console.log(e);
			}
		}
	}
}
