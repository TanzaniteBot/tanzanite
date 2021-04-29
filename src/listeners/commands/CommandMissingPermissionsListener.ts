/* eslint-disable @typescript-eslint/no-empty-function */
import { BushListener } from '../../lib/extensions/BushListener';
import { BushCommand } from '../../lib/extensions/BushCommand';
import log from '../../lib/utils/log';
import { Message } from 'discord.js';

export default class CommandMissingPermissionsListener extends BushListener {
	public constructor() {
		super('CommandMissingPermissions', {
			emitter: 'commandHandler',
			event: 'missingPermissions',
			category: 'commands'
		});
	}

	public async exec(message: Message, command: BushCommand | null | undefined, type: 'client' | 'user', missing: unknown): Promise<void> {
		log.info(
			'CommandMissingPermissions',
			`<<${message.author.tag}>> tried to run <<${message.util.parsed.command}>> but could not because <<${type}>> is missing the <<${missing}>> permissions(s).`
		);
		if (type == 'client') {
			await message
				.reply(`<:error:837123021016924261> I am missing the \`${missing}\` permission(s) required for the \`${message.util.parsed.command}\` command.`)
				.catch(() => {});
		} else if (type == 'user') {
			await message
				.reply(`<:error:837123021016924261> You are missing the \`${missing}\` permission(s) required for the \`${message.util.parsed.command}\` command.`)
				.catch(() => {});
		}
	}
}
