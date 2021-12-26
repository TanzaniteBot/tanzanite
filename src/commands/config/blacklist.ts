import { AllowedMentions, BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import { GuildTextBasedChannel, User } from 'discord.js';

export default class BlacklistCommand extends BushCommand {
	public constructor() {
		super('blacklist', {
			aliases: ['blacklist', 'unblacklist'],
			category: 'config',
			description: 'A command to blacklist users and channels.',
			usage: ['blacklist|unblacklist <user|channel>'],
			examples: ['blacklist @user', 'unblacklist #channel'],
			args: [
				{
					id: 'action',
					description: 'Whether to blacklist or unblacklist the target.',
					readableType: "'blacklist'|'unblacklist'",
					prompt: 'Would you like to add or remove someone or something from/to the blacklist?',
					slashType: 'STRING',
					choices: [
						{ name: 'blacklist', value: 'blacklist' },
						{ name: 'unblacklist', value: 'unblacklist' }
					],
					only: 'slash'
				},
				{
					id: 'target',
					description: 'The channel/user to blacklist.',
					type: util.arg.union('channel', 'user'),
					readableType: 'channel|user',
					prompt: 'What channel or user that you would like to blacklist/unblacklist?',
					retry: '{error} Pick a valid user or channel.',
					slashType: 'STRING'
				},
				{
					id: 'global',
					description: 'Blacklist the target globally.',
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

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { action?: 'blacklist' | 'unblacklist'; target: GuildTextBasedChannel | User | string; global: boolean }
	) {
		let action: 'blacklist' | 'unblacklist' | 'toggle' =
			args.action ?? (message?.util?.parsed?.alias as 'blacklist' | 'unblacklist' | undefined) ?? 'toggle';
		const global = args.global && message.author.isOwner();
		const target =
			typeof args.target === 'string'
				? (await util.arg.cast('textChannel', message, args.target)) ?? (await util.arg.cast('user', message, args.target))
				: args.target;
		if (!target) return await message.util.reply(`${util.emojis.error} Choose a valid channel or user.`);
		const targetID = target.id;

		if (!message.guild && global)
			return await message.util.reply(`${util.emojis.error} You have to be in a guild to disable commands.`);
		const blacklistedUsers = global
			? util.getGlobal('blacklistedUsers')
			: (await message.guild!.getSetting('blacklistedChannels')) ?? [];
		const blacklistedChannels = global
			? util.getGlobal('blacklistedChannels')
			: (await message.guild!.getSetting('blacklistedUsers')) ?? [];
		if (action === 'toggle') {
			action = blacklistedUsers.includes(targetID) || blacklistedChannels.includes(targetID) ? 'unblacklist' : 'blacklist';
		}
		const newValue = util.addOrRemoveFromArray(
			action === 'blacklist' ? 'add' : 'remove',
			target instanceof User ? blacklistedUsers : blacklistedChannels,
			targetID
		);

		const key = target instanceof User ? 'blacklistedUsers' : 'blacklistedChannels';

		const success = await (global
			? util.setGlobal(key, newValue)
			: message.guild!.setSetting(key, newValue, message.member!)
		).catch(() => false);

		if (!success)
			return await message.util.reply({
				content: `${util.emojis.error} There was an error${global ? ' globally' : ''} ${action}ing ${util.format.input(
					target instanceof User ? target.tag : target.name
				)}.`,
				allowedMentions: AllowedMentions.none()
			});
		else
			return await message.util.reply({
				content: `${util.emojis.success} Successfully ${action}ed ${util.format.input(
					target instanceof User ? target.tag : target.name
				)}${global ? ' globally' : ''}.`,
				allowedMentions: AllowedMentions.none()
			});
	}
}
