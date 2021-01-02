import { Message, MessageEmbed, TextChannel } from 'discord.js'
import { BotListener } from '../../classes/BotListener'

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
		
		// put other stuff here

	}
}
