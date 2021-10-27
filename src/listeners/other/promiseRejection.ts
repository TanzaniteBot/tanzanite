import { BushListener } from '@lib';
import CommandErrorListener from '../commands/commandError';

export default class PromiseRejectionListener extends BushListener {
	public constructor() {
		super('promiseRejection', {
			emitter: 'process',
			event: 'unhandledRejection'
		});
	}

	public override async exec(error: Error) {
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
