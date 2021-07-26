import { BushCommandHandlerEvents, BushListener } from '@lib';

export default class SlashMissingPermissionsListener extends BushListener {
	public constructor() {
		super('slashMissingPermissions', {
			emitter: 'commandHandler',
			event: 'slashMissingPermissions',
			category: 'commands'
		});
	}

	public async exec(...[message, command, type, missing]: BushCommandHandlerEvents['slashMissingPermissions']): Promise<void> {
		const niceMissing = [];
		missing.forEach((missing) => {
			if (this.client.consts.mappings.permissions[missing]) {
				niceMissing.push(this.client.consts.mappings.permissions[missing].name);
			} else {
				niceMissing.push(missing);
			}
		});

		const discordFormat = util.oxford(util.surroundArray(niceMissing, '`'), 'and', '');
		const consoleFormat = util.oxford(util.surroundArray(niceMissing, '<<', '>>'), 'and', '');
		this.client.console.info(
			'CommandMissingPermissions',
			`<<${message.author.tag}>> tried to run <<${
				command?.id
			}>> but could not because <<${type}>> is missing the ${consoleFormat} permissions${missing.length ? 's' : ''}.`,
			true
		);
		if (type == 'client') {
			await message.util
				.reply(
					`${util.emojis.error} I am missing the ${discordFormat} permission${missing.length ? 's' : ''} required for the \`${
						command?.id
					}\` command.`
				)
				.catch(() => {});
		} else if (type == 'user') {
			await message.util
				.reply(
					`${util.emojis.error} You are missing the ${discordFormat} permission${
						missing.length ? 's' : ''
					} required for the \`${command?.id}\` command.`
				)
				.catch(() => {});
		}
	}
}
