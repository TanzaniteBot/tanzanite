import { Command } from 'discord-akairo'
import { Message } from 'discord.js'

export default class ChannelPermsCommand extends Command {
	public constructor() {
		super('channelPerms', {
			aliases: ['channelPerms', 'channelPerm','cp'],
			category: 'owner',
			description: {
				content: 'A command mass set channel permissions',
				usage: '',
				examples: [
					''
				]
			}
		})
	}
	public exec(message: Message): void {
		message.util.send('wip')
	}
}