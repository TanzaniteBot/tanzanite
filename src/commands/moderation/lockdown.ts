import {
	AllowedMentions,
	BushCommand,
	BushNewsChannel,
	BushTextChannel,
	BushThreadChannel,
	ConfirmationPrompt,
	type ArgType,
	type BushMessage,
	type BushSlashMessage,
	type OptionalArgType
} from '#lib';
import assert from 'assert';
import { Collection } from 'discord.js';

export default class LockdownCommand extends BushCommand {
	public constructor() {
		super('lockdown', {
			aliases: ['lockdown', 'lock'],
			category: 'moderation',
			description: 'Allows you to lockdown a channel or all configured channels.',
			usage: ['lockdown [channel] [reason] [--all]'],
			examples: ['lockdown', 'lockdown --all'],
			args: [
				{
					id: 'channel',
					description: 'Specify a different channel to lockdown instead of the one you trigger the command in.',
					type: util.arg.union('textChannel', 'newsChannel', 'threadChannel'),
					prompt: 'What channel would you like to lockdown?',
					slashType: 'CHANNEL',
					channelTypes: ['GUILD_TEXT', 'GUILD_NEWS', 'GUILD_NEWS_THREAD', 'GUILD_PUBLIC_THREAD', 'GUILD_PRIVATE_THREAD'],
					optional: true
				},
				{
					id: 'reason',
					description: 'The reason for the lockdown.',
					type: 'string',
					match: 'rest',
					prompt: 'What is the reason for the lockdown?',
					slashType: 'STRING',
					optional: true
				},
				{
					id: 'all',
					description: 'Whether or not to lock all configured channels.',
					match: 'flag',
					flag: '--all',
					prompt: 'Would you like to lockdown all configured channels?',
					slashType: 'BOOLEAN',
					optional: true
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['MANAGE_CHANNELS']),
			userPermissions: ['MANAGE_CHANNELS']
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: {
			channel: OptionalArgType<'textChannel'> | OptionalArgType<'newsChannel'> | OptionalArgType<'threadChannel'>;
			reason: OptionalArgType<'string'>;
			all: ArgType<'boolean'>;
		}
	) {
		client.console.debug('lockdown command');
		return await LockdownCommand.lockdownOrUnlockdown(message, args, 'lockdown');
	}

	public static async lockdownOrUnlockdown(
		message: BushMessage | BushSlashMessage,
		args: {
			channel: OptionalArgType<'textChannel'> | OptionalArgType<'newsChannel'> | OptionalArgType<'threadChannel'>;
			reason: OptionalArgType<'string'>;
			all: ArgType<'boolean'>;
		},
		action: 'lockdown' | 'unlockdown'
	) {
		assert(message.inGuild());
		if (message.util.isSlashMessage(message)) await message.interaction.deferReply();

		if (args.channel && args.all)
			return await message.util.reply(`${util.emojis.error} You can't specify a channel and set all to true at the same time.`);

		const channel = args.channel ?? message.channel;

		if (!(channel instanceof BushTextChannel || channel instanceof BushNewsChannel || channel instanceof BushThreadChannel))
			return await message.util.reply(
				`${util.emojis.error} You can only ${action} text channels, news channels, and thread channels.`
			);

		if (args.all) {
			const confirmation = await ConfirmationPrompt.send(message, {
				content: `Are you sure you want to ${action} all channels?`
			});
			if (!confirmation) return message.util.sendNew(`${util.emojis.error} Lockdown cancelled.`);
		}

		const response = await message.guild.lockdown({
			moderator: message.author,
			channel: channel ?? undefined,
			reason: args.reason ?? undefined,
			all: args.all ?? false,
			unlock: action === 'unlockdown'
		});

		if (response instanceof Collection) {
			return await message.util.sendNew({
				content: `${util.emojis.error} The following channels failed to ${action}:`,
				embeds: [
					{
						description: response.map((e, c) => `<#${c}> : ${e.message}`).join('\n'),
						color: util.colors.warn
					}
				]
			});
		} else {
			let messageResponse;
			if (response === 'all not chosen and no channel specified') {
				messageResponse = `${util.emojis.error} You must specify a channel to ${action}.`;
			} else if (response.startsWith('invalid channel configured: ')) {
				const channels = response.replace('invalid channel configured: ', '');
				const actionFormatted = `${action.replace('down', '')}ed`;
				messageResponse = `${util.emojis.error} Some of the channels configured to be ${actionFormatted} cannot be resolved: ${channels}}`;
			} else if (response === 'no channels configured') {
				messageResponse = `${util.emojis.error} The all option is selected but there are no channels configured to be locked down.`;
			} else if (response === 'moderator not found') {
				messageResponse = `${util.emojis.error} For some reason I could not resolve you?`;
			} else if (response.startsWith('success: ')) {
				const num = Number.parseInt(response.replace('success: ', ''));
				messageResponse = `${util.emojis.success} Successfully ${
					action === 'lockdown' ? 'locked down' : 'unlocked'
				} **${num}** channel${num > 0 ? 's' : ''}.`;
			} else {
				throw new Error(`Unknown response: ${response}`);
			}

			assert(messageResponse);
			return await message.util.sendNew({ content: messageResponse, allowedMentions: AllowedMentions.none() });
		}
	}
}
