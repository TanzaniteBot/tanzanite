import { AllowedMentions, BushCommand, Global, type BushMessage, type BushSlashMessage } from '#lib';

export default class DisableCommand extends BushCommand {
	public constructor() {
		super('disable', {
			aliases: ['disable', 'enable'],
			category: 'config',
			description: 'A command to disable and enable commands.',
			usage: ['disable|enable <command>'],
			examples: ['enable ban', 'disable kick'],
			args: [
				{
					id: 'action',
					description: 'Whether to disable or enable the command.',
					readableType: "'blacklist'|'unblacklist",
					prompt: 'Would you like to disable or enable a command?',
					slashType: 'STRING',
					choices: ['blacklist', 'unblacklist'].map((v) => ({ name: v, value: v })),
					only: 'slash'
				},
				{
					id: 'command',
					description: 'The command to disable/enable.',
					customType: util.arg.union('commandAlias', 'command'),
					readableType: 'command|commandAlias',
					prompt: 'What command would you like to enable/disable?',
					retry: '{error} Pick a valid command.',
					slashType: 'STRING'
				},
				{
					id: 'global',
					description: 'Disable the command globally.',
					match: 'flag',
					flag: '--global',
					optional: true,
					slashType: false,
					only: 'text',
					ownerOnly: true
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
			userPermissions: ['MANAGE_GUILD']
		});
	}

	blacklistedCommands = ['eval', 'disable'];

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { action: 'enable' | 'disable'; command: BushCommand | string; global: boolean }
	) {
		let action = (args.action ?? message?.util?.parsed?.alias ?? 'toggle') as 'disable' | 'enable' | 'toggle';
		const global = args.global && message.author.isOwner();
		const commandID = (args.command as BushCommand).id;

		const disabledCommands = global
			? ((await Global.findByPk(client.config.environment)) ?? (await Global.create({ environment: client.config.environment })))
					.disabledCommands
			: await message.guild!.getSetting('disabledCommands');

		if (action === 'toggle') action = disabledCommands.includes(commandID) ? 'disable' : 'enable';
		const newValue = util.addOrRemoveFromArray(action === 'disable' ? 'remove' : 'add', disabledCommands, commandID);
		const success = global
			? await util.setGlobal('disabledCommands', newValue).catch(() => false)
			: await message.guild!.setSetting('disabledCommands', newValue, message.member!).catch(() => false);
		if (!success)
			return await message.util.reply({
				content: `${util.emojis.error} There was an error${global ? ' globally' : ''} **${action.substring(
					0,
					action.length - 2
				)}ing** the **${commandID}** command.`,
				allowedMentions: AllowedMentions.none()
			});
		else
			return await message.util.reply({
				content: `${util.emojis.success} Successfully **${action.substring(
					0,
					action.length - 2
				)}ed** the **${commandID}** command${global ? ' globally' : ''}.`,
				allowedMentions: AllowedMentions.none()
			});
	}
}
