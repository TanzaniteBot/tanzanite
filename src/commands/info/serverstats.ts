import { Command } from 'discord-akairo'
import { Message, MessageEmbed } from 'discord.js'
import got from 'got/dist/source'
import BotClient from '../../client/BotClient'

export default class ServerStatusCommand extends Command {
	public constructor() {
		super('serverstatus', {
			aliases: ['serverstatus', 'ss'],
			category: 'info',
			ratelimit: 4,
			cooldown: 4000,
		})
	}
	public async exec(message: Message): Promise<void> {
		const client = <BotClient> this.client
		const msgEmbed: MessageEmbed = new MessageEmbed()
			.setTitle('Server status')
			.setDescription('Checking servers:\nMain: ...\nBackup: ...')
			.setColor(client.consts.DefaultColor)
		const msg: Message = await message.util.send(msgEmbed)
		let main, back: string
		try {
			JSON.parse((await got.get('http://51.79.51.21/lowestbin.json')).body)
			main = '✅'
		} catch (e) {
			main = '❌'
		}

		await msg.edit(msgEmbed.setDescription(`Checking servers:\nMain: ${main}\nBackup: ...`))

		try {
			JSON.parse((await got.get('http://51.75.78.252/lowestbin.json')).body)
			back = '✅'
		} catch (e) {
			back = '❌'
		}

		await msg.edit(msgEmbed.setDescription(`Checking servers:\nMain: ${main}\nBackup: ${back}`))

		await client.consts.sleep(0.5)

		if ((back == '✅' && main == '❌') || (main == '✅' && back == '❌')) {
			await msg.edit(msgEmbed.setDescription('It appears one of the servers was online, this means that it should be fine as long as you have the latest version of NEU.').setColor(client.consts.Orange))
		}
		else if (back == '❌' && main == '❌') {
			await msg.edit(msgEmbed.setDescription('It appears both of the servers are offline, this means that everything related to prices will likely not work.').setColor(client.consts.Red))
		}
		else {
			await msg.edit(msgEmbed.setDescription('Both of the servers are online, all features related to prices will likely work.').setColor(client.consts.Green))
		}
	}
}