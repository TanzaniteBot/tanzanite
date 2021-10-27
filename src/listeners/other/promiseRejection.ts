import { BushListener } from '@lib';
import { Severity } from '@sentry/node';
import CommandErrorListener from '../commands/commandError';

export default class PromiseRejectionListener extends BushListener {
	public constructor() {
		super('promiseRejection', {
			emitter: 'process',
			event: 'unhandledRejection'
		});
	}

	public override async exec(error: Error) {
		client.sentry.captureException(error, {
			level: Severity.Error
		});

		void client.console.error(
			'promiseRejection',
			`An unhanded promise rejection occurred:\n${typeof error == 'object' ? error.stack : error}`,
			false
		);
		if (!error.message.includes('reason: getaddrinfo ENOTFOUND canary.discord.com'))
			void client.console.channelError({
				embeds: [await CommandErrorListener.generateErrorEmbed({ type: 'unhandledRejection', error: error })]
			});
	}
}
