import { BotCommand, type CommandMessage } from '#lib/extensions/discord-akairo/BotCommand.js';
import { SlashMessage } from '#lib/extensions/discord-akairo/SlashMessage.js';

export default class IronmoonCommand extends BotCommand {
	public constructor() {
		super('ironmoon', {
			category: 'fake-commands',
			description: '',
			examples: [''],
			usage: [''],
			pseudo: true,
			clientPermissions: [],
			userPermissions: []
		});
	}

	public override condition(message: CommandMessage): boolean {
		return false;
		if (message.content.toLowerCase().includes('ironmoon')) return true;
		else return false;
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		return await message.util.reply('Your message included the word ironmoon.');
	}
}
