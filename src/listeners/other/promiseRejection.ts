import { BushListener } from '@lib';
import CommandErrorListener from '../commands/commandError';

export default class PromiseRejectionListener extends BushListener {
	public constructor() {
		super('promiseRejection', {
			emitter: 'process',
			event: 'unhandledRejection'
		});
	}

	public override async exec(error: Error): Promise<void> {
		// eslint-disable-next-line @typescript-eslint/no-base-to-string
		void client.console.error('promiseRejection', `An unhanded promise rejection occurred:\n${error?.stack ?? error}`, false);
		void client.console.channelError({
			embeds: [await CommandErrorListener.generateErrorEmbed({ type: 'unhandledRejection', error: error })]
		});
	}
}
