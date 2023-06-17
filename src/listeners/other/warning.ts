import { BotListener, colors, Emitter, formatError, generateErrorEmbed } from '#lib';

export default class WarningListener extends BotListener {
	public constructor() {
		super('warning', {
			emitter: Emitter.Process,
			event: 'warning'
		});
	}

	public async exec(error: Error) {
		if (error.name === 'ExperimentalWarning') return;

		if (error.name === 'DeprecationWarning') {
			switch (error.message) {
				case 'User#tag is deprecated. Use User#username instead.':
					// while discord is migrating to the new username system, it is not complete
					// and it would be dumb to switch to User#username before all users have
					// transitioned to the new system
					return;
				default:
					break;
			}
		}

		this.client.sentry.captureException(error, {
			level: 'warning'
		});

		void this.client.console.warn('warning', `A warning occurred:\n${formatError(error, true)}`, false);

		const embeds = await generateErrorEmbed(this.client, { type: 'unhandledRejection', error: error });
		embeds[0].setColor(colors.warn).setTitle('A Warning Occurred');

		void this.client.console.channelError({ embeds });
	}
}
