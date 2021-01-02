import { BotCommand } from '../../classes/BotCommand'
import { Message } from 'discord.js'
import { User } from 'discord.js'
import { MessageEmbed } from 'discord.js'
import { TextChannel } from 'discord.js'

export default class BanCommand extends BotCommand {
	public constructor() {
		super('ban', {
			aliases: ['ban'],
			category: 'moderation',
			description: {
				content: 'A command ban members.',
				usage: 'ban <user> <reason>',
				examples: [
					'ban @user bad smh'
				],
			},
			clientPermissions: ['BAN_MEMBERS'],
			userPermissions: ['BAN_MEMBERS'],
			args : [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to ban?'
					}
				},
				{
					id: 'delDuration',
					type: 'number'
				},
				{
					id: 'reason',
					type: 'string',
					prompt: {
						start: 'Why is the user getting banned?'
					}
				}
			
			],
			channel: 'guild'
		})
	}
	public async exec(message: Message, {user, delDuration, reason}: {user: User, delDuration: number, reason: string} ): Promise<void> {
		if(delDuration == null){
			delDuration = 0 
		}
		let reason1 = 'reason'
		if(reason == null)
			reason1 = 'No reason specified. Responsible user: ' + message.author.username
		else{
			reason1 = reason + 'Responsible user: ' + message.author.username
		}
	
		try{
			const member = message.guild.members.resolve(user)
			await member.ban({
				days: delDuration,
				reason: reason1
			})
			const BanEmbed = new MessageEmbed() 
				.setDescription(user.username+' Has been banned.')	
				.setColor(this.client.consts.SuccessColor)
			message.util.send(BanEmbed)
		}catch(e){
			const generalLogChannel = <TextChannel> this.client.channels.cache.get(this.client.config.generalLogChannel)
			generalLogChannel.send(e)
		}
	}
}