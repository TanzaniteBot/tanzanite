import { BotCommand } from '../../classes/BotCommand';
import { Message } from 'discord.js';

export default class FixMuteCommand extends BotCommand {
	public constructor() {
		super('FixMute', {
			aliases: ['FixMute', 'MuteFix'],
			category: 'Server Admin',
			description: {
				content: "Tells you all the channels that mute doesn't work in.",
				usage: 'FixMute',
				examples: ['FixMute'],
			},
			channel: 'guild',
			ownerOnly: true,
			clientPermissions: ['MANAGE_CHANNELS'], //,
			//userPermissions: []
		});
	}
	public async exec(message: Message): Promise<void> {
		/*const channels = message.guild.channels.cache.filter.arguments(this.id)
		message.util.send(channels)*/
		//message.member.permissionsIn('channel_id').hasPermission('SEND_MESSAGES');
		//const array = []
		/*		
		try{
			const channels = this.client.channels.cache.array()
			for (const channel of channels) 
			{
				array.push(channel.id)
				message.util.send(channel.id)
			}}catch(err){
			message.util.send('array error')
			message.channel.send('An error occurred while getting the channels.')
			message.util.send(err)
		}
		//message.member.permissionsIn()
		message.guild.members.cache.get
		*/
		message.util.send('not done');
	}
}
