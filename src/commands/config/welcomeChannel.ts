import { Message, GuildChannel } from 'discord.js';
import db from '../../constants/db';
import { BotCommand } from '../../extensions/BotCommand';

export default class WelcomeChannelCommand extends BotCommand {
	constructor() {
		super('welcomechannel', {
			aliases: ['welcomechannel', 'welcome'],
			category: 'config',
			description: {
				content: 'A command to change a server\'s welcome channel.',
				usage: 'welcomechannel [channel]',
				examples: ['welcomechannel #welcome'],
			},
			args: [
				{
					id: 'channel',
					type: 'channel',
					prompt: {
						start: 'What channel would you like to make the welcome channel?',
						retry: '<:no:787549684196704257> Choose a valid channel.'
					}
				},
			],
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
		});
	}

	public async exec(message: Message, { channel }: { channel: GuildChannel | null | undefined }): Promise<void> {
		if (!channel) {
			await db.guildUpdate('welcomeChannel', null, message.guild.id);
			message.reply('Disabled the welcome channel.');
			return;
		} else {
			const oldChannel = await db.guildGet('welcomeChannel', message.guild.id, null);
			if (channel && channel.id){
				try{
					await db.guildUpdate('welcomeChannel', channel.id, message.guild.id);
				}catch(e) {
					message.reply('<:no:787549684196704257> There was an error setting the error channel.')
				}
				if (oldChannel){
					message.reply(`Changed the welcome channel from <#${oldChannel}> to <#${channel.id}>`)
				} else {
					message.reply(`Set the welcome channel to <#${channel.id}>`)
				}
			}else {
				message.reply('<:no:787549684196704257> That is not a valid channel, please try again.')
			}
		}
	}
}
