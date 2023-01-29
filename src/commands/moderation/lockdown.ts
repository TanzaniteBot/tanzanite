import {
	AllowedMentions,
	BotCommand,
	colors,
	ConfirmationPrompt,
	emojis,
	format,
	GuildTextBasedChannelTypes,
	type ArgType,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType, Collection, NewsChannel, TextChannel, ThreadChannel, VoiceChannel } from 'discord.js';
import assert from 'node:assert/strict';

export default class LockdownCommand extends BotCommand {
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
					type: 'textBasedChannel',
					prompt: 'What channel would you like to lockdown?',
					slashType: ApplicationCommandOptionType.Channel,
					channelTypes: GuildTextBasedChannelTypes,
					optional: true
				},
				{
					id: 'reason',
					description: 'The reason for the lockdown.',
					type: 'string',
					match: 'rest',
					prompt: 'What is the reason for the lockdown?',
					slashType: ApplicationCommandOptionType.String,
					optional: true
				},
				{
					id: 'all',
					description: 'Whether or not to lock all configured channels.',
					match: 'flag',
					flag: '--all',
					prompt: 'Would you like to lockdown all configured channels?',
					slashType: ApplicationCommandOptionType.Boolean,
					optional: true
				}
			],
			slash: true,
			channel: 'guild',
			clientPermissions: ['ManageChannels'],
			userPermissions: ['ManageChannels'],
			userCheckChannel: true,
			lock: 'channel'
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: {
			channel: OptArgType<'textBasedChannel'>;
			reason: OptArgType<'string'>;
			all: ArgType<'flag'>;
		}
	) {
		return await LockdownCommand.lockdownOrUnlockdown(message, args, 'lockdown');
	}

	public static async lockdownOrUnlockdown(
		message: CommandMessage | SlashMessage,
		args: {
			channel: OptArgType<'textBasedChannel'>;
			reason: OptArgType<'string'>;
			all: ArgType<'flag'>;
		},
		action: 'lockdown' | 'unlockdown'
	) {
		assert(message.inGuild());
		if (message.util.isSlashMessage(message)) await message.interaction.deferReply();

		if (args.channel && args.all)
			return await message.util.reply(`${emojis.error} You can't specify a channel and set all to true at the same time.`);

		const channel = args.channel ?? message.channel;

		if (
			!(
				channel instanceof TextChannel ||
				channel instanceof NewsChannel ||
				channel instanceof ThreadChannel ||
				channel instanceof VoiceChannel
			)
		)
			return await message.util.reply(
				`${emojis.error} You can only ${action} text channels, news channels, and thread channels.`
			);

		if (args.all) {
			const confirmation = await ConfirmationPrompt.send(message, {
				content: `Are you sure you want to ${action} all channels?`
			});
			if (!confirmation) return message.util.sendNew(`${emojis.error} Lockdown cancelled.`);
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
				content: `${emojis.error} The following channels failed to ${action}:`,
				embeds: [
					{
						description: response.map((e, c) => `<#${c}> : ${e.message}`).join('\n'),
						color: colors.warn
					}
				]
			});
		} else {
			let messageResponse;
			if (response === 'all not chosen and no channel specified') {
				messageResponse = `${emojis.error} You must specify a channel to ${action}.`;
			} else if (response.startsWith('invalid channel configured: ')) {
				const channels = response.replace('invalid channel configured: ', '');
				const actionFormatted = `${action.replace('down', '')}ed`;
				messageResponse = `${emojis.error} Some of the channels configured to be ${actionFormatted} cannot be resolved: ${channels}}`;
			} else if (response === 'no channels configured') {
				messageResponse = `${emojis.error} The all option is selected but there are no channels configured to be locked down.`;
			} else if (response === 'moderator not found') {
				messageResponse = `${emojis.error} For some reason I could not resolve you?`;
			} else if (response.startsWith('success: ')) {
				const num = Number.parseInt(response.replace('success: ', ''));
				messageResponse = `${emojis.success} Successfully ${
					action === 'lockdown' ? 'locked down' : 'unlocked'
				} **${num}** channel${num > 0 ? 's' : ''}.`;
			} else {
				return `${emojis.error} An error occurred: ${format.input(response)}}`;
			}

			assert(messageResponse);
			return await message.util.sendNew({ content: messageResponse, allowedMentions: AllowedMentions.none() });
		}
	}
}
