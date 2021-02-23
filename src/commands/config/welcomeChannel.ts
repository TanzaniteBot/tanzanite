import { Message, GuildChannel } from 'discord.js';
import db from '../../constants/db'
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
				}
			],
			channel: 'guild',
			userPermissions: 'MANAGE_GUILD'
		});
	}

	public async exec(message: Message, {channel}: { channel: GuildChannel|null|undefined }): Promise<void> {
		if (!channel){
			await db.guildUpdate('welcomeChannel', null, message.guild.id)
			message.channel.send('Disabled the welcome channel.')
			return
		} else {
			let oldChannel = await db.guildGet('welcomeChannel', message.guild.id, [])
			if (oldChannel){
				oldChannel = `<#${oldChannel}>`
			}else{
				oldChannel = 'no previously set channel'
			}
			await db.guildUpdate('welcomeChannel', channel.id, message.guild.id);
			message.channel.send(`Changed the WelcomeChannel from ${oldChannel} to <#${channel.id}>`);
		}
	}
}