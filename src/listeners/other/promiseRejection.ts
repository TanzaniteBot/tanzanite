import { BushListener } from '#lib';
import CommandErrorListener from '../commands/commandError.js';

export default class PromiseRejectionListener extends BushListener {
	public constructor() {
		super('promiseRejection', {
			emitter: 'process',
			event: 'unhandledRejection',
			type: 'prependListener'
		});
	}

	public override async exec(error: Error) {
		process.listeners('unhandledRejection').forEach((listener) => {
			if (listener.toString() === this.exec.toString()) return;
			process.removeListener('unhandledRejection', listener);
		});

		client.sentry.captureException(error, {
			level: 'error'
		});

		void client.console.error(
			'promiseRejection',
			`An unhanded promise rejection occurred:\n${util.formatError(error, true)}`,
			false
		);
		if (!error.message.includes('reason: getaddrinfo ENOTFOUND canary.discord.com'))
			void client.console.channelError({
				embeds: await CommandErrorListener.generateErrorEmbed({ type: 'unhandledRejection', error: error })
			});
	}
}
