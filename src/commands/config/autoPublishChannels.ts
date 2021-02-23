import { BotCommand } from '../../extensions/BotCommand';
import { Message, Channel } from 'discord.js';
import db from '../../constants/db'


export default class AutoPublishChannelsCommand extends BotCommand {
	public constructor() {
		super('autopublishchannel', {
			aliases: ['autopublishchannel', 'apc', 'publishchannel', 'autopublishchannels', 'publishchannels', 'autopublish'],
			category: 'config',
			description: {
				content: 'A command to add/remove channels from being automatically published.',
				usage: 'autopublishchannel <channel>',
				examples: ['autopublishchannel #github'],
			},
			args: [
				{
					id: 'channel',
					type: 'channel',
					match: 'content',
					prompt: {
						start: 'What channel would you like to toggle?',
					},
				},
			],
			channel: 'guild',
			userPermissions: 'MANAGE_GUILD'
		});
	}
	public async exec(message: Message, { channel }: { channel: Channel }): Promise<Message> {
		let action: string;
		const autoPublishChannels: string[] = await db.guildGet('autoPublishChannels', message.guild.id, []) as string[]
		if (autoPublishChannels.includes(channel.id)) {
			autoPublishChannels.splice(autoPublishChannels.indexOf(channel.id), 1);
			await db.guildUpdate('autoPublishChannels', autoPublishChannels, message.guild.id)
			action = 'disabled';
		} else {
			autoPublishChannels.push(channel.id);
			await db.guildUpdate('autoPublishChannels', autoPublishChannels, message.guild.id)
			action = 'enabled';
		}
		return await message.channel.send(`Successfully ${action} auto publishing in <#${channel.id}>.`);
	}
}
