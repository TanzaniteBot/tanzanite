import { Listener, Command } from 'discord-akairo'
import { TextChannel } from 'discord.js'
import { Message } from 'discord.js'

export default class CommandBlockedListener extends Listener {
	public constructor() {
		super('commandBlocked', {
			emitter: 'commandHandler',
			event: 'commandBlocked',
			category: 'commands'
		})
	}

	public exec(message: Message, command: Command, reason: string): void {
		switch (reason) {
			case 'owner': {
				message.util.send(`You must be an owner to run command \`${message.util.parsed.command}\``)
				break
			}
			case 'disabled': {
				message.util.send(`Command ${command.aliases[0]} is currently disabled.`)
				break
			}
			case 'channelBlacklist': {
				// message.util.send(`\`${(message.channel as TextChannel).name}\` is a blacklisted channel.`)
				break
			}
			case 'userBlacklist': {
				message.util.send(`Command blocked because ${message.author.username} is blacklisted from the bot.`)
				break
			}
			case 'roleBlacklist': {
				message.util.send(`Command blocked because ${message.author.username} has a role that is blacklisted from using the bot.`)
				break
			}
			default: {
				message.util.send(`Command blocked with reason \`${reason}\``)
			}
		}
	}
}
