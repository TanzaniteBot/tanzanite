import { PermissionString } from 'discord.js';
import { BushCommand, BushListener, BushMessage } from '../../lib';

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
		missing: Array<PermissionString>
	): Promise<void> {
		this.client.console.debug(message.guild.me.permissions.toArray());
		missing.forEach((permission) => {
			this.client.console.debug(message.guild.me.permissions.has(permission));
		});
		message.guild.me.permissions;
		this.client.console.debug(type);
		this.client.console.debug(command.clientPermissions);
		this.client.console.debug(command.userPermissions);
		this.client.console.debug(missing);
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
