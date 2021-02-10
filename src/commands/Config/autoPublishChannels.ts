import { BotCommand, PermissionLevel } from '../../extensions/BotCommand';
import { Message, Channel } from 'discord.js';

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
						start: 'What would you like to disable?',
					},
				},
			],
			userPermissions: 'MANAGE_GUILD'
		});
	}
	public async exec(message: Message, { channel }: { channel: Channel }): Promise<Message> {
		
		
		let action: string;
		const autoPublishChannels: string[] = await this.client.guildSettings.get(message.guild.id, 'autoPublishChannels', [])
		if (autoPublishChannels.includes(channel.id)) {
			autoPublishChannels.splice(autoPublishChannels.indexOf(channel.id), 1);
			this.client.guildSettings.set(message.guild.id, 'autoPublishChannels', autoPublishChannels)
			action = 'disabled';
		} else {
			autoPublishChannels.push(channel.id);
			this.client.guildSettings.set(message.guild.id, 'autoPublishChannels', autoPublishChannels)
			action = 'enabled';
		}
		return await message.channel.send(`Successfully ${action} auto publishing in <#${channel.id}>.`);
	}
}
