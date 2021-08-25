import { AllowedMentions, BushCommand, BushMessage } from '@lib';
import { Channel } from 'discord.js';

export default class AutoPublishChannelCommand extends BushCommand {
	public constructor() {
		super('autopublishchannel', {
			aliases: ['autopublishchannel', 'apc', 'publishchannel', 'autopublishchannels', 'publishchannels', 'autopublish'],
			category: 'config',
			description: {
				content: 'A command to add/remove channels from being automatically published.',
				usage: 'autopublishchannel <channel>',
				examples: ['autopublishchannel #github']
			},
			args: [
				{
					id: 'channel',
					type: 'channel',
					match: 'content',
					prompt: {
						start: 'What channel would you like to toggle auto publishing in?',
						retry: '{error} Choose a valid channel.',
						optional: false
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'channel',
					description: 'What channel would you like me to send welcome messages in?',
					type: 'CHANNEL',
					required: true
				}
			],
			channel: 'guild',
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['MANAGE_GUILD', 'SEND_MESSAGES']
		});
	}

	public override async exec(message: BushMessage, { channel }: { channel: Channel }): Promise<unknown> {
		const autoPublishChannels = await message.guild!.getSetting('autoPublishChannels');
		const newValue = util.addOrRemoveFromArray(
			autoPublishChannels.includes(channel.id) ? 'remove' : 'add',
			autoPublishChannels,
			channel.id
		);
		await message.guild!.setSetting('autoPublishChannels', newValue);
		client.logger.debugRaw(autoPublishChannels);
		client.logger.debugRaw(channel.id);
		client.logger.debugRaw(autoPublishChannels.includes(channel.id));
		return await message.util.reply({
			content: `${util.emojis.success} Successfully ${
				autoPublishChannels.includes(channel.id) ? 'disabled' : 'enabled'
			} auto publishing in <#${channel.id}>.`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
