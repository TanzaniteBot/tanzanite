import { TextChannel } from 'discord.js'


function discordLog(logMessage){
	const generalLogChannel = <TextChannel> this.client.channels.cache.get(this.client.config.generalLogChannel)
	generalLogChannel.send(logMessage)
}