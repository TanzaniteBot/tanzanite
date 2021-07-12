import { BushListener } from '@lib';

export default class PromiseRejectionListener extends BushListener {
	public constructor() {
		super('promiseRejection', {
			emitter: 'process',
			event: 'unhandledRejection'
		});
	}

	public async exec(error: Error): Promise<void> {
		this.client.console.error('PromiseRejection', `An unhanded promise rejection occurred:\n${error?.stack || error}`, false);
		this.client.console.channelError({
			embeds: [
				{
					title: 'Unhandled promise rejection',
					fields: [{ name: 'error', value: await this.client.util.codeblock(`${error?.stack || error}`, 1024, 'js') }],
					color: this.client.util.colors.error
				}
			]
		});
	}
}
