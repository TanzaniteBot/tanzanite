import { Message, MessageEmbed, TextChannel } from 'discord.js'
import { BotListener } from '../../classes/BotListener'
import CommandErrorListener from '../commands/CommandErrorListener'


export default class ReadyListener extends BotListener {
	public constructor() {
		super('MessageListener', {
			emitter: 'client',
			event: 'message',
			category: 'client'
		})
	}

	

	public async exec(message: Message): Promise<void> {
		// on dm
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
		/*=========== 
		Auto Publish
		=============*/
		/*const autoPublishChannels: string[] = [
			'793522444718964787', //announcement test
			'782464759165354004' //item repo github webhooks
		]
		if(message.channel.type === 'news' && autoPublishChannels.some(x => message.channel.id.includes(x))){
			try{
				console.log('Found unpublished message ('+message.id+') in channel '+message.channel.name+'('+message.channel.id+') in '+message.guild.name)
				await message.crosspost()
				console.log('Published message.')
			}catch(e){
				console.log(e)
			}
		}*/
		// put other shit here

	}
}
