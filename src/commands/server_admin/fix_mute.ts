import { BotCommand } from '../../classes/BotCommand'
import { Message } from 'discord.js'

export default class FixMuteCommand extends BotCommand {
	public constructor() {
		super('FixMute', {
			aliases: ['FixMute','MuteFix'],
			category: '',
			description: {
				content: 'Tells you all the channels that mute doesn\'t work in.',
				usage: 'FixMute',
				examples: [
					'FixMute'
				],
			},
			channel: 'guild',
			ownerOnly: true,
			clientPermissions: ['MANAGE_CHANNELS']//,
			//userPermissions: []
		})
	}
	public async exec(message: Message): Promise<void> {
		/*const channels = message.guild.channels.cache.filter.arguments(this.id)
		console.log(channels)*/
		//message.member.permissionsIn('channel_id').hasPermission('SEND_MESSAGES');
		//const array = []
		/*		
		try{
			const channels = this.client.channels.cache.array()
			for (const channel of channels) 
			{
				array.push(channel.id)
				console.log(channel.id)
			}}catch(err){
			console.log('array error')
			message.channel.send('An error occurred while getting the channels.')
			console.log(err)
		}
		//message.member.permissionsIn()
		message.guild.members.cache.get
		*/
		message.util.send('not done')
	}
}