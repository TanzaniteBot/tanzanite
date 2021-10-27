import { BushCommandHandlerEvents, BushListener } from '@lib';

export default class CommandMissingPermissionsListener extends BushListener {
	public constructor() {
		super('commandMissingPermissions', {
			emitter: 'commandHandler',
			event: 'missingPermissions',
			category: 'commands'
		});
	}

	public override async exec(...[message, command, type, missing]: BushCommandHandlerEvents['missingPermissions']) {
		return await CommandMissingPermissionsListener.handleMissing(message, command, type, missing);
	}

	public static async handleMissing(
		...[message, command, type, missing]:
			| BushCommandHandlerEvents['missingPermissions']
			| BushCommandHandlerEvents['slashMissingPermissions']
	) {
		const niceMissing = (missing.includes('ADMINISTRATOR') ? (['ADMINISTRATOR'] as 'ADMINISTRATOR'[]) : missing).map(
			(perm) => client.consts.mappings.permissions[perm]?.name ?? missing
		);

		const discordFormat = util.oxford(util.surroundArray(niceMissing, '**'), 'and', '');
		const consoleFormat = util.oxford(util.surroundArray(niceMissing, '<<', '>>'), 'and', '');
		void client.console.info(
			'commandMissingPermissions',
			`<<${message.author.tag}>> tried to run <<${
				command?.id
			}>> but could not because <<${type}>> is missing the ${consoleFormat} permissions${missing.length ? 's' : ''}.`
		);
		if (type == 'client') {
			return await message.util
				.reply(
					`${util.emojis.error} I am missing the ${discordFormat} permission${missing.length ? 's' : ''} required for the \`${
						command?.id
					}\` command.`
				)
				.catch(() => {});
		} else if (type == 'user') {
			return await message.util
				.reply(
					`${util.emojis.error} You are missing the ${discordFormat} permission${
						missing.length ? 's' : ''
					} required for the **${command?.id}** command.`
				)
				.catch(() => {});
		}
	}
}
