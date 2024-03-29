import { BotListener, Emitter, formatError, generateErrorEmbed, ListenerType } from '#lib';

export default class PromiseRejectionListener extends BotListener {
	public constructor() {
		super('promiseRejection', {
			emitter: Emitter.Process,
			event: 'unhandledRejection',
			type: ListenerType.PrependListener
		});
	}

	public async exec(error: Error) {
		process.listeners('unhandledRejection').forEach((listener) => {
			if (listener.toString() === this.exec.toString()) return;
			process.removeListener('unhandledRejection', listener);
		});

		this.client.sentry.captureException(error, {
			level: 'error'
		});

		void this.client.console.error(
			'promiseRejection',
			`An unhanded promise rejection occurred:\n${formatError(error, true)}`,
			false
		);
		if (
			!error.message.includes('reason: getaddrinfo ENOTFOUND canary.discord.com') &&
			!error.message.includes('Expected token to be set for this request, but none was present') &&
			!error.message.includes('Connection terminated unexpectedly')
		) {
			void this.client.console.channelError({
				embeds: await generateErrorEmbed(this.client, { type: 'unhandledRejection', error: error })
			});
		} else {
			process.exit(1);
		}
	}
}
