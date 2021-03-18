import { BushListener } from '../../lib/extensions/BushListener';
import { unindent } from 'common-tags';
import { MessageEmbed } from 'discord.js';

export default class PromiseRejectionListener extends BushListener {
	constructor() {
		super('PromiseRejectionListener', {
			emitter: 'process',
			event: 'unhandledRejection',
			category: 'client'
		});
	}
	public async exec(error: Error, promise: Promise<unknown>): Promise<void> {
		await this.error(
			new MessageEmbed({
				title: 'Unhandled promise rejection',
				description: unindent`
			 Promise \`${promise}\` threw an error, unhandled.
			 Stack: ${await this.client.consts.haste(error.stack)}
			`
			})
		);
	}
}
