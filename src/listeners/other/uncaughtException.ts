import { BotListener, Emitter, formatError, generateErrorEmbed, ListenerType } from '#lib';

export default class UncaughtExceptionListener extends BotListener {
	public constructor() {
		super('uncaughtException', {
			emitter: Emitter.Process,
			event: 'uncaughtException',
			type: ListenerType.PrependListener
		});
	}

	public async exec(error: Error) {
		process.listeners('uncaughtException').forEach((listener) => {
			if (listener.toString() === this.exec.toString()) return;
			process.removeListener('uncaughtException', listener);
		});
		this.client.sentry.captureException(error, {
			level: 'error'
		});

		void this.client.console.error('uncaughtException', `An uncaught exception occurred:\n${formatError(error, true)}`, false);
		void this.client.console.channelError({
			embeds: await generateErrorEmbed(this.client, { type: 'uncaughtException', error: error })
		});
	}
}
