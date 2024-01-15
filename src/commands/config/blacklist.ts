import {
	AllowedMentions,
	Arg,
	BotCommand,
	addOrRemoveFromArray,
	emojis,
	format,
	type ArgType,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType, GuildMember, User } from 'discord.js';
import assert from 'node:assert/strict';

export default class BlacklistCommand extends BotCommand {
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
					slashType: ApplicationCommandOptionType.String,
					choices: ['blacklist', 'unblacklist'].map((c) => ({ name: c, value: c })),
					only: 'slash'
				},
				{
					id: 'target',
					description: 'The channel/user to blacklist.',
					type: Arg.union('channel', 'user'),
					readableType: 'channel|user',
					prompt: 'What channel or user that you would like to blacklist/unblacklist?',
					retry: '{error} Pick a valid user or channel.',
					slashType: ApplicationCommandOptionType.String
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
			clientPermissions: [],
			userPermissions: ['ManageGuild']
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: {
			action?: 'blacklist' | 'unblacklist';
			target: ArgType<'channel' | 'user'> | string; // there is no way to combine channel and user in slash commands without making subcommands
			global: ArgType<'flag'>;
		}
	) {
		let action: 'blacklist' | 'unblacklist' | 'toggle' =
			args.action ?? (message?.util?.parsed?.alias as 'blacklist' | 'unblacklist' | undefined) ?? 'toggle';
		const global = args.global && message.author.isOwner();
		const target =
			typeof args.target === 'string'
				? (await Arg.cast('textChannel', message, args.target)) ?? (await Arg.cast('user', message, args.target))
				: args.target;
		if (!target) return await message.util.reply(`${emojis.error} Choose a valid channel or user.`);
		const targetID = target.id;

		if (!message.inGuild() && !global)
			return await message.util.reply(`${emojis.error} You have to be in a guild to disable commands.`);

		if (!global) assert(message.inGuild());

		const blacklistedUsers = global
			? this.client.utils.getGlobal('blacklistedUsers')
			: (await message.guild!.getSetting('blacklistedChannels')) ?? [];
		const blacklistedChannels = global
			? this.client.utils.getGlobal('blacklistedChannels')
			: (await message.guild!.getSetting('blacklistedUsers')) ?? [];
		if (action === 'toggle') {
			action = blacklistedUsers.includes(targetID) || blacklistedChannels.includes(targetID) ? 'unblacklist' : 'blacklist';
		}
		const newValue = addOrRemoveFromArray(
			action === 'blacklist' ? 'add' : 'remove',
			target instanceof User ? blacklistedUsers : blacklistedChannels,
			targetID
		);

		const key = target instanceof User ? 'blacklistedUsers' : 'blacklistedChannels';

		const success = await (
			global
				? this.client.utils.setGlobal(key, newValue)
				: message.guild!.setSetting(key, newValue, message.member as GuildMember)
		).catch(() => false);

		if (!success)
			return await message.util.reply({
				content: `${emojis.error} There was an error${global ? ' globally' : ''} ${action}ing ${format.input(
					target instanceof User ? target.tag : target.name
				)}.`,
				allowedMentions: AllowedMentions.none()
			});
		else
			return await message.util.reply({
				content: `${emojis.success} Successfully ${action}ed ${format.input(target instanceof User ? target.tag : target.name)}${
					global ? ' globally' : ''
				}.`,
				allowedMentions: AllowedMentions.none()
			});
	}
}
