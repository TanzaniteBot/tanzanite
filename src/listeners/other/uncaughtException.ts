import { BushListener, formatError } from '#lib';
import CommandErrorListener from '../commands/commandError.js';

export default class UncaughtExceptionListener extends BushListener {
	public constructor() {
		super('uncaughtException', {
			emitter: 'process',
			event: 'uncaughtException',
			type: 'prependListener'
		});
	}

	public async exec(error: Error) {
		process.listeners('uncaughtException').forEach((listener) => {
			if (listener.toString() === this.exec.toString()) return;
			process.removeListener('uncaughtException', listener);
		});
		client.sentry.captureException(error, {
			level: 'error'
		});

		void client.console.error('uncaughtException', `An uncaught exception occurred:\n${formatError(error, true)}`, false);
		void client.console.channelError({
			embeds: await CommandErrorListener.generateErrorEmbed({ type: 'uncaughtException', error: error })
		});
	}
}
