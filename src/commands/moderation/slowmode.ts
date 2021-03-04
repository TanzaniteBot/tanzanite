import { BotCommand } from '../../extensions/BotCommand';
import { Message, MessageEmbed, TextChannel, Channel } from 'discord.js';
import { Argument } from 'discord-akairo';

export default class SlowModeCommand extends BotCommand {
	public constructor() {
		super('slowMode', {
			aliases: ['slowMode', 'slow'],
			category: 'moderation',
			description: {
				content: 'A command to set the slowmode of a channel.',
				usage: 'slowmode <length>',
				examples: ['slowmode 3'],
			},
			clientPermissions: ['MANAGE_CHANNELS'],
			userPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES', 'EMBED_LINKS'],
			args: [
				{
					id: 'length',
					type: Argument.range('integer', 1, 21600, true),
					default: '0',
					prompt: {
						start: 'What would you like to set the slowmode to?',
						retry: '<:no:787549684196704257> Please set the slowmode to a valid length.'
					}
				},
				{
					id: 'selectedChannel',
					type: 'channel',
					default: (m) => m.channel,//tf is this?
				},
			],
			channel: 'guild',
		});
	}
	public async exec(message: Message, { length, selectedChannel }: { length: number; selectedChannel: Channel }): Promise<void> {
		if (length < 0 || length > 21600) {
			const errorEmbed = new MessageEmbed();
			errorEmbed.setColor(this.client.consts.ErrorColor).setDescription(`<:no:787549684196704257> \`${length}\` is not a valid length to set as the slowmode.`);
			message.reply(errorEmbed);
			return
		}

		if (!(selectedChannel instanceof TextChannel)) {
			const errorEmbed = new MessageEmbed();
			errorEmbed.setColor(this.client.consts.ErrorColor).setDescription(`<#${selectedChannel.id}> is not a text channel.`);
			await message.reply(errorEmbed);
			return
		}

		await selectedChannel.setRateLimitPerUser(length, `Changed by ${message.author.tag} (${message.author.id}).`);
		const successEmbed = new MessageEmbed();
		successEmbed
			.setColor(this.client.consts.SuccessColor)
			.setDescription(`Successfully changed the slowmode of ${selectedChannel} to \`${length}\`.`);
		await message.reply(successEmbed);
		return
	}
}
