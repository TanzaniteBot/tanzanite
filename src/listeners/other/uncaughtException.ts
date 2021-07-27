import { BushListener } from '@lib';

export default class UncaughtExceptionListener extends BushListener {
	public constructor() {
		super('uncaughtException', {
			emitter: 'process',
			event: 'uncaughtException'
		});
	}

	public async exec(error: Error): Promise<void> {
		void client.console.error('uncaughtException', `An uncaught exception occurred:\n${error?.stack || error}`, false);
		void client.console.channelError({
			embeds: [
				{
					title: 'An uncaught exception occurred',
					fields: [{ name: 'error', value: await util.codeblock(`${error?.stack || error}`, 1024, 'js') }],
					color: util.colors.error
				}
			]
		});
	}
}
