import { BotCommand } from '../../classes/BotCommand'
import { Message, MessageEmbed } from 'discord.js'
import got from 'got'

export default class ServerStatusCommand extends BotCommand {
	public constructor() {
		super('serverstatus', {
			aliases: ['serverstatus', 'ss'],
			description: {
				usage: 'serverstatus',
				examples: [
					'serverstatus',
					'ss'
				],
				content: 'Gives the status of moulberry\'s server'
			},
			category: 'info',
			ratelimit: 4,
			cooldown: 4000,
		})
	}
	public async exec(message: Message): Promise<void> {
		const msgEmbed: MessageEmbed = new MessageEmbed()
			.setTitle('Server status')
			.setDescription('Checking servers:\nMain: ...\nBackup: ...')
			.setColor(this.client.consts.DefaultColor)
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

		await this.client.consts.sleep(0.5)

		if ((back == '✅' && main == '❌') || (main == '✅' && back == '❌')) {
			await msg.edit(msgEmbed.addField('Status', 'It appears one of the servers was online, this means that it should be fine as long as you have the latest version of NEU.').setColor(this.client.consts.Orange))
		}
		else if (back == '❌' && main == '❌') {
			await msg.edit(msgEmbed.addField('Status', 'It appears both of the servers are offline, this means that everything related to prices will likely not work.').setColor(this.client.consts.Red))
		}
		else {
			await msg.edit(msgEmbed.addField('Status', 'Both of the servers are online, all features related to prices will likely work.').setColor(this.client.consts.Green))
		}
	}
}