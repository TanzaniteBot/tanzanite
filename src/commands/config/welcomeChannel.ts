import { BotCommand } from '../../extensions/BotCommand';
import { Message, GuildChannel } from 'discord.js';
import functions from '../../constants/functions'

export default class WelcomeChannelCommand extends BotCommand {
	constructor() {
		super('welcomechannel', {
			aliases: ['welcomechannel', 'welcome'],
			category: 'config',
			description: {
				content: 'A command to change a server\'s welcome channel.',
				usage: 'welcomechannel [channel]',
				examples: ['prefix #welcome'],
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
			await functions.dbUpdate('guild', 'welcomeChannel', '', message.guild.id)
			message.channel.send('Disabled the welcome channel.')
			return
		} else {
			let oldChannel = await functions.dbGet('guild', 'welcomeChannel', message.guild.id)
			if (oldChannel){
				oldChannel = `<#${oldChannel}>`
			}else{
				oldChannel = 'no previously set channel'
			}
			await functions.dbUpdate('guild', 'welcomeChannel', channel.id, message.guild.id);
			message.channel.send(`Changed the WelcomeChannel from ${oldChannel} to <#${channel.id}>`);
		}
	}
}