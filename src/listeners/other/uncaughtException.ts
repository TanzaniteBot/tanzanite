import { BushListener } from '@lib';

export default class UncaughtExceptionListener extends BushListener {
	public constructor() {
		super('uncaughtException', {
			emitter: 'process',
			event: 'uncaughtException'
		});
	}

	public async exec(error: Error): Promise<void> {
		this.client.console.error('uncaughtException', `An uncaught exception occurred:\n${error?.stack || error}`, false);
		this.client.console.channelError({
			embeds: [
				{
					title: 'An uncaught exception occurred',
					fields: [{ name: 'error', value: await this.client.util.codeblock(`${error?.stack || error}`, 1024, 'js') }],
					color: this.client.util.colors.error
				}
			]
		});
	}
}
