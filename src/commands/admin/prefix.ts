import { BotCommand } from '../../lib/extensions/BotCommand';
import { BotMessage } from '../../lib/extensions/BotMessage';

export default class PrefixCommand extends BotCommand {
	constructor() {
		super('prefix', {
			aliases: ['prefix'],
			args: [
				{
					id: 'prefix'
				}
			],
			userPermissions: ['MANAGE_GUILD']
		});
	}
	async exec(
		message: BotMessage,
		{ prefix }: { prefix?: string }
	): Promise<void> {
		if (prefix) {
			await message.settings.setPrefix(prefix);
			await message.util.send(`Sucessfully set prefix to \`${prefix}\``);
		} else {
			await message.settings.setPrefix(this.client.config.prefix);
			await message.util.send(
				`Sucessfully reset prefix to \`${this.client.config.prefix}\``
			);
		}
	}
}
