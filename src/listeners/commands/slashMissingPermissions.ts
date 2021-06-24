import { Command } from 'discord-akairo';
import { CommandInteraction } from 'discord.js';
import { BushListener } from '../../lib/extensions/BushListener';

export default class SlashMissingPermissionsListener extends BushListener {
	public constructor() {
		super('slashMissingPermissions', {
			emitter: 'commandHandler',
			event: 'slashMissingPermissions',
			category: 'slashCommands'
		});
	}

	public async exec(
		interaction: CommandInteraction,
		command: Command,
		type: 'user' | 'client',
		missing?: string[]
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
			`<<${interaction.user.tag}>> tried to run <<${
				command?.id
			}>> but could not because <<${type}>> is missing the ${consoleFormat} permissions${missing.length ? 's' : ''}.`,
			true
		);
		if (type == 'client') {
			await this.client.util
				.slashRespond(
					interaction,
					`${this.client.util.emojis.error} I am missing the ${discordFormat} permission${
						missing.length ? 's' : ''
					} required for the \`${command?.id}\` command.`
				)
				.catch(() => {});
		} else if (type == 'user') {
			await this.client.util
				.slashRespond(
					interaction,
					`${this.client.util.emojis.error} You are missing the ${discordFormat} permission${
						missing.length ? 's' : ''
					} required for the \`${command?.id}\` command.`
				)
				.catch(() => {});
		}
	}
}
