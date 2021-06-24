import { BushCommand } from '../../lib/extensions/BushCommand';
import { BushSlashMessage } from '../../lib/extensions/BushInteractionMessage';
import { BushMessage } from '../../lib/extensions/BushMessage';
import { Guild } from '../../lib/models';

export default class PrefixCommand extends BushCommand {
	constructor() {
		super('prefix', {
			aliases: ['prefix'],
			category: 'config',
			args: [
				{
					id: 'prefix',
					type: 'string',
					prompt: {
						start: 'What would you like the new prefix to be?',
						retry: '{error} Choose a valid prefix',
						optional: true
					}
				}
			],
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD'],
			description: {
				content: 'Set the prefix of the current server (resets to default if prefix is not given)',
				usage: 'prefix [prefix]',
				examples: ['prefix', 'prefix +']
			},
			slashOptions: [
				{
					type: 'STRING',
					name: 'prefix',
					description: 'The prefix to set for this server',
					required: false
				}
			],
			slash: true
		});
	}

	async exec(message: BushMessage | BushSlashMessage, { prefix }: { prefix?: string }): Promise<void> {
		let row = await Guild.findByPk(message.guild.id);
		if (!row) {
			row = Guild.build({
				id: message.guild.id
			});
		}
		await row.update({ prefix: prefix || this.client.config.prefix });
		if (prefix) {
			await message.util.send(`${this.client.util.emojis.success} changed prefix from \`${prefix}\` to `);
		} else {
			await message.util.send(`${this.client.util.emojis.success} reset prefix to \`${this.client.config.prefix}\``);
		}
	}
}
