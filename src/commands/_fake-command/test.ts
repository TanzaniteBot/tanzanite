import { BushCommand, BushMessage, BushSlashMessage } from '@lib';

export default class TestCommand extends BushCommand {
	public constructor() {
		super('test', {
			category: 'fake-commands',
			description: { content: '', examples: '', usage: '' },
			condition: (message: BushMessage) => {
				if (message.content.toLowerCase().includes('ironmoon')) return true;
				else return false;
			},
			completelyHide: true
		});
	}
	public async exec(message: BushMessage | BushSlashMessage): Promise<unknown> {
		return await message.util.reply('Your message included the word ironmoon.');
	}
}
