import { Message } from 'discord.js';
import { BushListener } from '../../lib/extensions/BushListener';

import log from '../../lib/utils/log';
import { BushCommand } from '../../lib/extensions/BushCommand';

export default class CommandMissingPermissionsListener extends BushListener {
	public constructor() {
		super('CommandMissingPermissions', {
			emitter: 'commandHandler',
			event: 'missingPermissions',
			category: 'commands'
		});
	}

	public async exec(message: Message, command: BushCommand | null | undefined, type: 'client' | 'user', missing: unknown): Promise<void> {
		log.info('CommandMissingPermissions', `<<${message.author.tag}>> tried to run <<${message.util.parsed.command}>> but could not because <<${type}>> is missing the <<${missing}>> permissions(s).`);
		if (type == 'client') {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			await message.reply(`<:no:787549684196704257> I am missing the \`${missing}\` permission(s) required for the \`${message.util.parsed.command}\`.`).catch(() => {});
		} else if (type == 'user') {
			// eslint-disable-next-line @typescript-eslint/no-empty-function
			await message.reply(`<:no:787549684196704257> You are missing the \`${missing}\` permission(s) required for the \`${message.util.parsed.command}\`.`).catch(() => {});
		}
	}
}
