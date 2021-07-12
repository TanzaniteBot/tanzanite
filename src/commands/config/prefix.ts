import { BushCommand, BushMessage, BushSlashMessage } from '@lib';

export default class PrefixCommand extends BushCommand {
	public constructor() {
		super('prefix', {
			aliases: ['prefix'],
			category: 'config',
			description: {
				content: 'Set or reset the prefix for the server.',
				usage: 'prefix [prefix]',
				examples: ['prefix', 'prefix +']
			},
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD'],
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
			slash: true,
			slashOptions: [
				{
					type: 'STRING',
					name: 'prefix',
					description: 'What would you like the new prefix to be?',
					required: false
				}
			]
		});
	}

	async exec(message: BushMessage | BushSlashMessage, args: { prefix?: string }): Promise<unknown> {
		const oldPrefix = await message.guild.getSetting('prefix');
		await message.guild.setSetting('prefix', args.prefix ?? this.client.config.prefix);
		if (args.prefix) {
			return await message.util.send(
				`${this.client.util.emojis.success} changed the server's prefix ${oldPrefix ? `from \`${oldPrefix}\`` : ''} to \`${
					args.prefix
				}\`.`
			);
		} else {
			return await message.util.send(
				`${this.client.util.emojis.success} reset the server's prefix to \`${this.client.config.prefix}\`.`
			);
		}
	}
}
