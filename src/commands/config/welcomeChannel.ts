import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message, GuildChannel } from 'discord.js';
import db from '../../constants/db';

export default class WelcomeChannelCommand extends BushCommand {
	constructor() {
		super('welcomechannel', {
			aliases: ['welcomechannel', 'welcome'],
			category: 'config',
			description: {
				content: "A command to change a server's welcome channel.",
				usage: 'welcomechannel [channel]',
				examples: ['welcomechannel #welcome']
			},
			args: [
				{
					id: 'channel',
					type: 'channel',
					prompt: {
						start: 'What channel would you like to make the welcome channel?',
						retry: '<:error:837123021016924261> Choose a valid channel.'
					}
				}
			],
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD', 'SEND_MESSAGES']
		});
	}

	public async exec(message: Message, { channel }: { channel: GuildChannel | null | undefined }): Promise<void> {
		if (!channel) {
			await db.guildUpdate('welcomeChannel', null, message.guild.id);
			message.util.reply('Disabled the welcome channel.');
			return;
		} else {
			const oldChannel = await db.guildGet('welcomeChannel', message.guild.id, null);
			if (channel && channel.id) {
				try {
					await db.guildUpdate('welcomeChannel', channel.id, message.guild.id);
				} catch (e) {
					message.util.reply('<:error:837123021016924261> There was an error setting the error channel.');
				}
				if (oldChannel) {
					message.util.reply(`Changed the welcome channel from <#${oldChannel}> to <#${channel.id}>`);
				} else {
					message.util.reply(`Set the welcome channel to <#${channel.id}>`);
				}
			} else {
				message.util.reply('<:error:837123021016924261> That is not a valid channel, please try again.');
			}
		}
	}
}
