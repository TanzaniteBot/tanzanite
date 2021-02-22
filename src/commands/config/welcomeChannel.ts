import { BotCommand } from '../../extensions/BotCommand';
import { Message } from 'discord.js';
import { GuildChannel } from 'discord.js';

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
					default: undefined
				}
			],
			channel: 'guild',
			userPermissions: 'MANAGE_GUILD'
		});
	}

	public async exec(message: Message, args: { channel: GuildChannel|undefined; }): Promise<void> {
		if (args.channel === undefined){
			await this.client.guildSettings.set(message.guild.id, 'welcomeChannel', undefined);
			message.channel.send('Disabled the welcome channel.')
		} else {
			let oldChannel = this.client.guildSettings.get(message.guild.id, 'welcomeChannel', undefined);
			if (oldChannel !== undefined){
				oldChannel = `<#${oldChannel}>`
			}else{
				oldChannel = 'no previously set channel'
			}
			await this.client.guildSettings.set(message.guild.id, 'welcomeChannel', args.channel.id);
			message.channel.send(`Changed the WelcomeChannel from ${oldChannel} to <#${args.channel.id}>`)
		}
	}
}