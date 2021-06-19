import { BushListener } from '../../lib/extensions/BushListener';

export default class PromiseRejectionListener extends BushListener {
	constructor() {
		super('promiseRejection', {
			emitter: 'process',
			event: 'unhandledRejection'
		});
	}

	public async exec(error: Error): Promise<void> {
		this.client.console.error('PromiseRejection', 'An unhanded promise rejection occurred:\n' + error.stack, false);
		await this.client.console.channelError({
			embeds: [
				{
					title: 'Unhandled promise rejection',
					fields: [{ name: 'error', value: await this.client.util.codeblock(error.stack, 1024, 'js') }],
					color: this.client.util.colors.error
				}
			]
		});
	}
}
