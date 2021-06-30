import { BushCommand } from '../../lib/extensions/discord-akairo/BushCommand';
import { BushListener } from '../../lib/extensions/discord-akairo/BushListener';
import { BushMessage } from '../../lib/extensions/discord.js/BushMessage';

export default class CommandMissingPermissionsListener extends BushListener {
	public constructor() {
		super('commandMissingPermissions', {
			emitter: 'commandHandler',
			event: 'missingPermissions',
			category: 'commands'
		});
	}

	public async exec(
		message: BushMessage,
		command: BushCommand | null | undefined,
		type: 'client' | 'user',
		missing: Array<string>
	): Promise<void> {
		const niceMissing = [];
		missing.forEach((missing) => {
			if (this.client.consts.mappings.permissions[missing]) {
				niceMissing.push(this.client.consts.mappings.permissions[missing].name);
			} else {
				niceMissing.push(missing);
			}
		});

		const discordFormat = this.client.util.oxford(this.client.util.surroundArray(niceMissing, '`'), 'and', '');
		const consoleFormat = this.client.util.oxford(this.client.util.surroundArray(niceMissing, '<<', '>>'), 'and', '');
		this.client.console.info(
			'CommandMissingPermissions',
			`<<${message.author.tag}>> tried to run <<${
				command?.id
			}>> but could not because <<${type}>> is missing the ${consoleFormat} permissions${missing.length ? 's' : ''}.`
		);
		if (type == 'client') {
			await message.util
				.reply(
					`${this.client.util.emojis.error} I am missing the ${discordFormat} permission${
						missing.length ? 's' : ''
					} required for the \`${command?.id}\` command.`
				)
				.catch(() => {});
		} else if (type == 'user') {
			await message.util
				.reply(
					`${this.client.util.emojis.error} You are missing the ${discordFormat} permission${
						missing.length ? 's' : ''
					} required for the \`${command?.id}\` command.`
				)
				.catch(() => {});
		}
	}
}
