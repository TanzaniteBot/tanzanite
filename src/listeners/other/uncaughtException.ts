import { BushListener } from '#lib';
import { Severity } from '@sentry/node';
import CommandErrorListener from '../commands/commandError.js';

export default class UncaughtExceptionListener extends BushListener {
	public constructor() {
		super('uncaughtException', {
			emitter: 'process',
			event: 'uncaughtException'
		});
	}

	public override async exec(error: Error) {
		client.sentry.captureException(error, {
			level: Severity.Error
		});

		void client.console.error(
			'uncaughtException',
			`An uncaught exception occurred:\n${typeof error == 'object' ? error.stack : error}`,
			false
		);
		void client.console.channelError({
			embeds: [await CommandErrorListener.generateErrorEmbed({ type: 'uncaughtException', error: error })]
		});
	}
}
