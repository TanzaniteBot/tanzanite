import { BushCommand, BushMessage, BushNewsChannel, BushSlashMessage, BushTextChannel, BushThreadChannel } from '@lib';
import { Argument } from 'discord-akairo';
import { NewsChannel, TextChannel, ThreadChannel } from 'discord.js';

export default class SlowModeCommand extends BushCommand {
	public constructor() {
		super('slowmode', {
			aliases: ['slowmode', 'slow'],
			category: 'moderation',
			description: {
				content: 'A command to set the slowmode of a channel.',
				usage: 'slowmode <length>',
				examples: ['slowmode 3']
			},
			args: [
				{
					id: 'length',
					customType: Argument.union('duration', 'durationSeconds', 'off', 'none', 'disable'),
					prompt: {
						start: 'What would you like to set the slowmode to?',
						retry: '{error} Please set the slowmode to a valid length.',
						optional: true
					}
				},
				{
					id: 'channel',
					type: 'channel',
					prompt: {
						start: 'What channel would you like to change?',
						retry: '{error} Choose a valid channel.',
						optional: true
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'channel',
					description: 'What channel would you like to change the slowmode of?',
					type: 'CHANNEL',
					required: false
				}
			],
			channel: 'guild',
			clientPermissions: ['MANAGE_CHANNELS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			userPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES']
		});
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		{
			length,
			channel
		}: {
			length: number | 'off' | 'none' | 'disable';
			channel: TextChannel | ThreadChannel | BushTextChannel | BushNewsChannel | BushThreadChannel | NewsChannel;
		}
	): Promise<unknown> {
		if (message.channel!.type === 'DM')
			return await message.util.reply(`${util.emojis.error} This command cannot be run in dms.`);
		if (!channel) channel = message.channel as any;
		if (!(channel instanceof TextChannel) && !(channel instanceof ThreadChannel))
			return await message.util.reply(`${util.emojis.error} <#${channel.id}> is not a text or thread channel.`);
		if (length) {
			length =
				typeof length === 'string' && !['off', 'none', 'disable'].includes(length)
					? await util.arg.cast('duration', client.commandHandler.resolver, message as BushMessage, length)
					: length;
		}

		const length2: number = ['off', 'none', 'disable'].includes(length as string) ? 0 : (length as number);

		const setSlowmode = await (channel as ThreadChannel | TextChannel)
			.setRateLimitPerUser(length2 / 1000, `Changed by ${message.author.tag} (${message.author.id}).`)
			.catch(() => {});
		if (!setSlowmode)
			return await message.util.reply(
				`${util.emojis.error} There was an error changing the slowmode of <#${(channel as ThreadChannel | TextChannel).id}>.`
			);
		else
			return await message.util.reply(
				`${util.emojis.success} Successfully changed the slowmode of <#${channel.id}> ${
					length2 ? `to \`${util.humanizeDuration(length2)}` : '`off'
				}\`.`
			);
	}
}
