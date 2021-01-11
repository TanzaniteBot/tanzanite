import { Message, MessageEmbed, TextChannel } from 'discord.js'
import { BotListener } from '../../classes/BotListener'

export default class MessageListener extends BotListener {
	public constructor() {
		super('MessageListener', {
			emitter: 'client',
			event: 'message',
			category: 'client'
		})
	}

	public async exec(message: Message): Promise<void> {
		/*============
		||	dm logs	||
		==============*/
		if(message.channel.type === 'dm') {
			if (message.author.bot) return
			const dmlogembed = new MessageEmbed()
				.setAuthor(`From: ${message.author.username}`, `${message.author.displayAvatarURL({ dynamic: true })}`)
				.setDescription(`**DM:**\n${message}`)
				.setColor(this.client.consts.DefaultColor)
				.setTimestamp()
				.setFooter(`ID • ${message.author.id}`)
			const dmchannel = <TextChannel> this.client.channels.cache.get(this.client.config.dmChannel)
			dmchannel.send(dmlogembed)
		}
		/*====================
		||	Auto Publisher	||
		=====================*/

		if(message.channel.type === 'news' && this.client.config.autoPublishChannels.some(x => message.channel.id.includes(x))){
			const generalLogChannel = <TextChannel> this.client.channels.cache.get(this.client.config.generalLogChannel)
			try{
				generalLogChannel.send(`Found unpublished message (${message.id}) in channel ${message.channel.name}(${message.channel.id}) in ${message.guild.name}`)
				await message.crosspost()
				generalLogChannel.send('Published message.')
			}catch(e){
				generalLogChannel.send(e)
			}
		}
		
		/*================================================
		||	Sees if someone mentions a content creator	||
		==================================================*/
		try {
			if(message.author.bot) return
			const generalLogChannel = <TextChannel> this.client.channels.cache.get(this.client.config.generalLogChannel)
			if(message.mentions.members.first().roles.cache.has('729414120842985564')) {
				message.reply('Please dont mention content creators');
				generalLogChannel.send('testing')
			}else {
				return
			}
		} catch(error) {
			console.error(error.stack)
		}
	}
}