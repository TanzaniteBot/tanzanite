import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message, TextChannel, Channel } from 'discord.js';
import { Argument } from 'discord-akairo';

export default class SlowModeCommand extends BushCommand {
	public constructor() {
		super('slowMode', {
			aliases: ['slowMode', 'slow'],
			category: 'moderation',
			description: {
				content: 'A command to set the slowmode of a channel.',
				usage: 'slowmode <length>',
				examples: ['slowmode 3']
			},
			clientPermissions: ['MANAGE_CHANNELS', 'SEND_MESSAGES', 'EMBED_LINKS'],
			userPermissions: ['MANAGE_MESSAGES', 'SEND_MESSAGES', 'EMBED_LINKS'],
			args: [
				{
					id: 'length',
					type: Argument.range('integer', 0, 21600, true),
					default: '0',
					prompt: {
						start: 'What would you like to set the slowmode to?',
						retry: '<:no:787549684196704257> Please set the slowmode to a valid length.'
					}
				},
				{
					id: 'selectedChannel',
					type: 'channel',
					default: m => m.channel
				}
			],
			channel: 'guild'
		});
	}
	public async exec(message: Message, { length, selectedChannel }: { length: number; selectedChannel: Channel }): Promise<Message> {
		if (!(selectedChannel instanceof TextChannel)) return message.util.reply(`<:no:787549684196704257> <#${selectedChannel.id}> is not a text channel.`);
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const setSlowmode = await selectedChannel.setRateLimitPerUser(length, `Changed by ${message.author.tag} (${message.author.id}).`).catch(() => {});
		if (!setSlowmode) return message.util.reply(`<:no:787549684196704257> There was an error changing the slowmode of <#${selectedChannel.id}>.`);
		else return message.util.reply(`<:yes:787549618770149456> Successfully changed the slowmode of ${selectedChannel} to \`${length}\`.`);
	}
}
