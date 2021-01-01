import { Listener } from 'discord-akairo'
import BotClient from '../../client/BotClient'
export default class ReadyListener extends Listener {
	public constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready',
			category: 'client'
		})
	}

	public exec(): void {
		const client = <BotClient> this.client
		console.log(`Logged in to ${this.client.user.tag}`)
		console.log('-----------------------------------------------------------------------------')
		this.client.user.setPresence({activity: {name: `My prefix is ${client.config.prefix} or just mention me`, type: 'PLAYING'}, status: 'online'})
	}
}