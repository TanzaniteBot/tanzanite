import { BushCommand, BushMessage } from '@lib';

export default class AutoPublishChannelCommand extends BushCommand {
	public constructor() {
		super('autoPublishChannel', {
			aliases: ['autopublishchannel', 'apc', 'publishchannel', 'autopublishchannels', 'publishchannels', 'autopublish'],
			category: 'config',
			description: {
				content: 'This command has been deprecated, please use the config command instead',
				usage: 'autopublishchannel <channel>',
				examples: ['autopublishchannel #github']
			},
			channel: 'guild',
			hidden: true,
			clientPermissions: ['SEND_MESSAGES'],
			userPermissions: ['MANAGE_GUILD', 'SEND_MESSAGES']
		});
	}

	public override async exec(message: BushMessage): Promise<unknown> {
		return message.util.reply(`${util.emojis.error} 'This command has been deprecated, please use the config command instead'`);
	}
}
