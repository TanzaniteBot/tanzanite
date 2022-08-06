import { BushListener, colors, formatError } from '#lib';
import CommandErrorListener from '../commands/commandError.js';

export default class WarningListener extends BushListener {
	public constructor() {
		super('warning', {
			emitter: 'process',
			event: 'warning'
		});
	}

	public async exec(error: Error) {
		if (error.name === 'ExperimentalWarning') return;

		this.client.sentry.captureException(error, {
			level: 'warning'
		});

		void this.client.console.warn('warning', `A warning occurred:\n${formatError(error, true)}`, false);

		const embeds = await CommandErrorListener.generateErrorEmbed(this.client, { type: 'unhandledRejection', error: error });
		embeds[0].setColor(colors.warn).setTitle('A Warning Occurred');

		void this.client.console.channelError({ embeds });
	}
}
