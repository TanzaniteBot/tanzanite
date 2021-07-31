import { BushCommand, BushMessage, BushSlashMessage } from '@lib';

export default class IronmoonCommand extends BushCommand {
	public constructor() {
		super('ironmoon', {
			category: 'fake-commands',
			description: { content: '', examples: '', usage: '' },
			completelyHide: true
		});
	}
	public override condition(message: BushMessage): boolean {
		return false;
		if (message.content.toLowerCase().includes('ironmoon')) return true;
		else return false;
	}

	public override async exec(message: BushMessage | BushSlashMessage): Promise<unknown> {
		return await message.util.reply('Your message included the word ironmoon.');
	}
}
