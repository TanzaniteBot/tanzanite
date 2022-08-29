import { BotListener, emojis, format, mappings, oxford, surroundArray, type BotCommandHandlerEvents } from '#lib';
import { Client, type PermissionsString } from 'discord.js';

export default class CommandMissingPermissionsListener extends BotListener {
	public constructor() {
		super('commandMissingPermissions', {
			emitter: 'commandHandler',
			event: 'missingPermissions'
		});
	}

	public async exec(...[message, command, type, missing]: BotCommandHandlerEvents['missingPermissions']) {
		return await CommandMissingPermissionsListener.handleMissing(this.client, message, command, type, missing);
	}

	public static async handleMissing(
		client: Client,
		...[message, command, type, missing]:
			| BotCommandHandlerEvents['missingPermissions']
			| BotCommandHandlerEvents['slashMissingPermissions']
	) {
		const niceMissing = (missing.includes('Administrator') ? (['Administrator'] as PermissionsString[]) : missing).map(
			(perm) => mappings.permissions[perm]?.name ?? missing
		);

		const discordFormat = oxford(surroundArray(niceMissing, '**'), 'and', '');
		const consoleFormat = oxford(surroundArray(niceMissing, '<<', '>>'), 'and', '');
		void client.console.info(
			'commandMissingPermissions',
			`<<${message.author.tag}>> tried to run <<${
				command?.id
			}>> but could not because <<${type}>> is missing the ${consoleFormat} permissions${missing.length ? 's' : ''}.`
		);
		if (type == 'client') {
			return await message.util
				.reply(
					`${emojis.error} I am missing the ${discordFormat} permission${
						missing.length ? 's' : ''
					} required for the ${format.input(command?.id)} command.`
				)
				.catch(() => {});
		} else if (type == 'user') {
			return await message.util
				.reply(
					`${emojis.error} You are missing the ${discordFormat} permission${missing.length ? 's' : ''} required for the **${
						command?.id
					}** command.`
				)
				.catch(() => {});
		}
	}
}
