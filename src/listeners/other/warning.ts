import { BushListener } from '@lib';
import CommandErrorListener from '../commands/commandError';

export default class WarningListener extends BushListener {
	public constructor() {
		super('warning', {
			emitter: 'process',
			event: 'warning'
		});
	}

	public override async exec(error: Error) {
		void client.console.warn('warning', `A warning occurred:\n${typeof error == 'object' ? error.stack : error}`, false);
		void client.console.channelError({
			embeds: [
				(await CommandErrorListener.generateErrorEmbed({ type: 'unhandledRejection', error: error }))
					.setColor(util.colors.warn)
					.setTitle('A Warning Occurred')
			]
		});
	}
}
