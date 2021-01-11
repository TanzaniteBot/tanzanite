import { Message, MessageEmbed, TextChannel, DMChannel } from 'discord.js'
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
			if (!(message.author.id == this.client.user.id) && message.author.bot) return
			let dmlogembed: MessageEmbed
			if (message.author.id != this.client.user.id) {
				dmlogembed = new MessageEmbed()
					.setAuthor(message.author.username, `${message.author.displayAvatarURL({ dynamic: true })}`)
					.setDescription(`**DM:**\n${message}\nFrom: ${message.author.tag}\nTo: ${this.client.user.tag}`)
					.setColor(this.client.consts.DefaultColor)
					.setTimestamp()
					.setFooter(`ID • ${message.author.id}`)
			} else {
				dmlogembed = new MessageEmbed()
					.setAuthor(message.author.username, `${message.author.displayAvatarURL({ dynamic: true })}`)
					.setDescription(`**DM:**\n${message}\nFrom: ${this.client.user.tag}\nTo: ${message.author.tag}`)
					.setColor(this.client.consts.DefaultColor)
					.setTimestamp()
					.setFooter(`ID • ${message.author.id}`)
			}
			const dmchannel = <TextChannel> this.client.channels.cache.get(this.client.config.dmChannel)
			dmchannel.send(dmlogembed)
		}
		/*====================
		||	Auto Publisher	||
		=====================*/

		if(message.channel.type === 'news' && this.client.config.autoPublishChannels.some(x => message.channel.id.includes(x))){
			const generalLogChannel = <TextChannel> this.client.channels.cache.get(this.client.config.generalLogChannel)
			try{
				generalLogChannel.send(`Found unpublished message (<${message.url}>) in channel ${message.channel.name}(${message.channel.id}) in ${message.guild.name}`)
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
			const generalLogChannel = <TextChannel> this.client.channels.cache.get(this.client.config.generalLogChannel)
			if(message.mentions.members.first()?.roles.cache.has('729414120842985564')) {
				if(message.mentions.members.first()?.roles.cache.has('737308259823910992'|| '782803470205190164')) return
				if(message.mentions.members.first()?.roles.cache.has('782803470205190164')) return
				if(message.author.bot) return
				message.reply('Please dont mention content creators');
				const mentionlogembed = new MessageEmbed()
					.setTitle('A content creator was mentioned')
					.setColor(this.client.consts.DefaultColor)
					.addField('Mentioned User', `${message.mentions.members.first()}`)
					.addField('User', `${message.author} **|** ${message.author.id}`, false)
					.addField('Msg', `${message.channel}(**[link](${message.url})**)\n\n**Contents:** ${message}`)
					.setTimestamp()
					.setFooter('OwO')
				generalLogChannel.send(mentionlogembed)
			}else {
				return
			}
		} catch(error) {
			console.error(error.stack)
		}
	}
}
