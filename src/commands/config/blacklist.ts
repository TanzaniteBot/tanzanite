import { AllowedMentions, BushCommand, Global, type BushMessage, type BushSlashMessage } from '#lib';
import { GuildTextBasedChannels } from 'discord-akairo';
import { User } from 'discord.js';

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
		args: { action: 'blacklist' | 'unblacklist'; target: GuildTextBasedChannels | User | string; global: boolean }
	) {
		let action: 'blacklist' | 'unblacklist' | 'toggle' =
			args.action ?? (message?.util?.parsed?.alias as 'blacklist' | 'unblacklist') ?? 'toggle';
		const global = args.global && message.author.isOwner();
		const target =
			typeof args.target === 'string'
				? (await util.arg.cast('textChannel', message, args.target)) ?? (await util.arg.cast('user', message, args.target))
				: args.target;
		if (!target) return await message.util.reply(`${util.emojis.error} Choose a valid channel or user.`);
		const targetID = target.id;

		if (global) {
			if ((action as 'blacklist' | 'unblacklist' | 'toggle') === 'toggle') {
				const globalDB =
					(await Global.findByPk(client.config.environment)) ?? (await Global.create({ environment: client.config.environment }));
				const blacklistedUsers = globalDB.blacklistedUsers;
				const blacklistedChannels = globalDB.blacklistedChannels;
				action = blacklistedUsers.includes(targetID) || blacklistedChannels.includes(targetID) ? 'unblacklist' : 'blacklist';
			}
			const success = await util
				.insertOrRemoveFromGlobal(
					action === 'blacklist' ? 'add' : 'remove',
					target instanceof User ? 'blacklistedUsers' : 'blacklistedChannels',
					targetID
				)
				.catch(() => false);
			if (!success)
				return await message.util.reply({
					content: `${util.emojis.error} There was an error globally ${action}ing ${util.format.input(
						target instanceof User ? target.tag : target.name
					)}.`,
					allowedMentions: AllowedMentions.none()
				});
			else
				return await message.util.reply({
					content: `${util.emojis.success} Successfully ${action}ed ${util.format.input(
						target instanceof User ? target.tag : target.name
					)} globally.`,
					allowedMentions: AllowedMentions.none()
				});
			// guild disable
		} else {
			if (!message.guild) return await message.util.reply(`${util.emojis.error} You have to be in a guild to disable commands.`);
			const blacklistedChannels = (await message.guild.getSetting('blacklistedChannels')) ?? [];
			const blacklistedUsers = (await message.guild.getSetting('blacklistedUsers')) ?? [];
			if ((action as 'blacklist' | 'unblacklist' | 'toggle') === 'toggle') {
				action = blacklistedChannels.includes(targetID) ?? blacklistedUsers.includes(targetID) ? 'unblacklist' : 'blacklist';
			}
			const newValue = util.addOrRemoveFromArray(
				action === 'blacklist' ? 'add' : 'remove',
				target instanceof User ? blacklistedUsers : blacklistedChannels,
				targetID
			);
			const success = await message.guild
				.setSetting(target instanceof User ? 'blacklistedUsers' : 'blacklistedChannels', newValue, message.member!)
				.catch(() => false);
			if (!success)
				return await message.util.reply({
					content: `${util.emojis.error} There was an error ${action}ing ${util.format.input(
						target instanceof User ? target.tag : target.name
					)}.`,
					allowedMentions: AllowedMentions.none()
				});
			else
				return await message.util.reply({
					content: `${util.emojis.success} Successfully ${action}ed ${util.format.input(
						target instanceof User ? target.tag : target.name
					)}.`,
					allowedMentions: AllowedMentions.none()
				});
		}
	}
}
