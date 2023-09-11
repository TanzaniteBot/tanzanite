import {
	BotListener,
	CommandHandlerEvent,
	Emitter,
	emojis,
	format,
	formatList,
	mappings,
	surroundEach,
	type BotCommandHandlerEvents
} from '#lib';
import { Client, type PermissionsString } from 'discord.js';

export default class CommandMissingPermissionsListener extends BotListener {
	public constructor() {
		super('commandMissingPermissions', {
			emitter: Emitter.CommandHandler,
			event: CommandHandlerEvent.MissingPermissions
		});
	}

	public async exec(...[message, command, type, missing]: BotCommandHandlerEvents[CommandHandlerEvent.MissingPermissions]) {
		return await CommandMissingPermissionsListener.handleMissing(this.client, message, command, type, missing);
	}

	public static async handleMissing(
		client: Client,
		...[message, command, type, missing]: BotCommandHandlerEvents[
			| CommandHandlerEvent.MissingPermissions
			| CommandHandlerEvent.SlashMissingPermissions]
	) {
		const niceMissing = (missing.includes('Administrator') ? (['Administrator'] as PermissionsString[]) : missing).map(
			(perm) => mappings.permissions[perm as PermissionsString]?.name ?? missing
		);

		const discordFormat = formatList(surroundEach(niceMissing, '**'), 'and');
		const consoleFormat = formatList(surroundEach(niceMissing, '<<', '>>'), 'and');
		void client.console.info(
			'commandMissingPermissions',
			`<<${
				message.author.tag
			}>> tried to run <<${command?.id}>> but could not because <<${type}>> is missing the ${consoleFormat} permissions${
				missing.length ? 's' : ''
			}.`
		);

		// fix: this is far too jank
		if (missing.length === 1 && missing[0] === '[[UnsupportedChannel]]') {
			return await message.util
				.reply(`${emojis.error} Forum channels are not supported by the ${format.input(command?.id)} command.`)
				.catch(() => {});
		}

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
					`${emojis.error} You are missing the ${discordFormat} permission${
						missing.length ? 's' : ''
					} required for the **${command?.id}** command.`
				)
				.catch(() => {});
		}
	}
}
