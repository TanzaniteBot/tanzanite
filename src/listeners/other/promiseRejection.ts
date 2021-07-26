import { BushListener } from '@lib';

export default class PromiseRejectionListener extends BushListener {
	public constructor() {
		super('promiseRejection', {
			emitter: 'process',
			event: 'unhandledRejection'
		});
	}

	public async exec(error: Error): Promise<void> {
		client.console.error('PromiseRejection', `An unhanded promise rejection occurred:\n${error?.stack || error}`, false);
		client.console.channelError({
			embeds: [
				{
					title: 'Unhandled promise rejection',
					fields: [{ name: 'error', value: await util.codeblock(`${error?.stack || error}`, 1024, 'js') }],
					color: util.colors.error
				}
			]
		});
	}
}
