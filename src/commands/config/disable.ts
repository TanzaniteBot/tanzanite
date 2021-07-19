import { AllowedMentions, BushCommand, BushMessage, BushSlashMessage, Global } from '@lib';
import { Argument } from 'discord-akairo';

export default class DisableCommand extends BushCommand {
	public constructor() {
		super('disable', {
			aliases: ['disable', 'enable'],
			category: 'config',
			description: {
				content: 'A command to disable and enable commands.',
				usage: 'disable|enable <command>',
				examples: ['enable ban', 'disable kick']
			},
			args: [
				{
					id: 'command',
					type: Argument.union('commandAlias', 'command'),
					match: 'phrase',
					prompt: {
						start: 'What command would you like to enable/disable?',
						retry: '{error} Pick a valid command.',
						optional: false
					}
				},
				{
					id: 'global',
					match: 'flag',
					flag: '--global'
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'action',
					description: 'Would you like to disable or enable a command?',
					type: 'STRING',
					choices: [
						{
							name: 'enable',
							value: 'enable'
						},
						{
							name: 'disable',
							value: 'disable'
						}
					],
					required: true
				},
				{
					name: 'command',
					description: 'What command would you like to enable/disable?',
					type: 'STRING',
					required: true
				}
			],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD']
		});
	}

	blacklistedCommands = ['eval', 'disable'];

	public async exec(
		message: BushMessage | BushSlashMessage,
		args: { action: 'enable' | 'disable'; command: BushCommand | string; global: boolean }
	): Promise<unknown> {
		let action: 'disable' | 'enable' | 'toggle' =
			args.action ?? (message?.util?.parsed?.alias as 'disable' | 'enable') ?? 'toggle';
		const global = args.global && message.author.isOwner();
		const commandID = (args.command as BushCommand).id;

		if (global) {
			if (action === 'toggle') {
				const disabledCommands = (await Global.findByPk(this.client.config.environment)).disabledCommands;
				action = disabledCommands.includes(commandID) ? 'disable' : 'enable';
			}
			const success = await this.client.util
				.insertOrRemoveFromGlobal(action === 'disable' ? 'remove' : 'add', 'disabledCommands', commandID)
				.catch(() => false);
			if (!success)
				return await message.util.reply({
					content: `${this.client.util.emojis.error} There was an error globally **${action.substr(
						0,
						action.length - 2
					)}ing** the **${commandID}** command.`,
					allowedMentions: AllowedMentions.none()
				});
			else
				return await message.util.reply({
					content: `${this.client.util.emojis.success} Successfully **${action.substr(
						0,
						action.length - 2
					)}ed** the **${commandID}** command globally.`,
					allowedMentions: AllowedMentions.none()
				});

			// guild disable
		} else {
			const disabledCommands = await message.guild.getSetting('disabledCommands');
			if (action === 'toggle') {
				action = disabledCommands.includes(commandID) ? 'disable' : 'enable';
			}
			const newValue = this.client.util.addOrRemoveFromArray(
				action === 'disable' ? 'remove' : 'add',
				disabledCommands,
				commandID
			);
			const success = await message.guild.setSetting('disabledCommands', newValue).catch(() => false);
			if (!success)
				return await message.util.reply({
					content: `${this.client.util.emojis.error} There was an error **${action.substr(
						0,
						action.length - 2
					)}ing** the **${commandID}** command.`,
					allowedMentions: AllowedMentions.none()
				});
			else
				return await message.util.reply({
					content: `${this.client.util.emojis.success} Successfully **${action.substr(
						0,
						action.length - 2
					)}ed** the **${commandID}** command.`,
					allowedMentions: AllowedMentions.none()
				});
		}
	}
}
