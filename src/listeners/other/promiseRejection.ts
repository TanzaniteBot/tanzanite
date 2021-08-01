import { BushListener } from '@lib';

export default class PromiseRejectionListener extends BushListener {
	public constructor() {
		super('promiseRejection', {
			emitter: 'process',
			event: 'unhandledRejection'
		});
	}

	public override async exec(error: Error): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		void client.console.error('PromiseRejection', `An unhanded promise rejection occurred:\n${error?.stack || error}`, false);
		void client.console.channelError({
			embeds: [
				{
					title: 'Unhandled promise rejection',
					// eslint-disable-next-line @typescript-eslint/no-base-to-string
					fields: [{ name: 'error', value: await util.codeblock(`${error?.stack || error}`, 1024, 'js') }],
					color: util.colors.error
				}
			]
		});
	}
}
