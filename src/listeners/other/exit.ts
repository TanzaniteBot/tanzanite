import { BushListener } from '@lib';

export default class ExitListener extends BushListener {
	public constructor() {
		super('exit', {
			emitter: 'process',
			event: 'exit'
		});
	}

	public override async exec(code: number): Promise<void> {
		await client.console.error('processExit', `Process ended with code <<${code}>>.`);
	}
}
