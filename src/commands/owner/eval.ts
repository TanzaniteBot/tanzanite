import { MessageEmbed } from 'discord.js'
import { Message } from 'discord.js'
import { inspect } from 'util'
import { BotCommand } from '../../classes/BotCommand'

const clean = text => {
	if (typeof (text) === 'string')
		return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
	else
		return text
}

const isPromise = (value): boolean => value && typeof value.then == 'function'

export default class EvalCommand extends BotCommand {
	public constructor() {
		super('eval', {
			aliases: ['eval'],
			category: 'owner',
			description: {
				content: 'Use the command to eval stuff in the bot',
				usage: 'eval <code>',
				examples: [
					'eval message.guild.name',
					'eval this.client.ownerID'
				]
			},
			args: [
				{
					id: 'code',
					match: 'content',
					type: 'string',
					prompt: {
						start: 'What would you like to eval?'
					}
				}
			],
			ratelimit: 4,
			cooldown: 4000,
			ownerOnly: true,
		})
	}

	public async exec(message: Message, { code }: { code: string }): Promise<void> {
		const embed: MessageEmbed = new MessageEmbed()
		try {
			let output
			/* eslint-disable @typescript-eslint/no-unused-vars */
			const me = message.member,
				member = message.member,
				bot = this.client,
				guild = message.guild,
				channel = message.channel
			/* eslint-enable @typescript-eslint/no-unused-vars */
			output = eval(code)
			if (isPromise(output)) output = await output
			if (typeof output !== 'string') output = inspect(output, { depth: 0 })
			output = output.replace(new RegExp(this.client.token, 'g'), '[token omitted]')
			output = clean(output)
			embed
				.setTitle('✅ Evaled code succefully')
				.addField('📥 Input', code.length > 1012 ? 'Too large to display. Hastebin: ' + await this.client.consts.haste(code) : '```js\n'+code+'```')
				.addField('📤 Output', output.length > 1012 ? 'Too large to display. Hastebin: ' + await this.client.consts.haste(output) : '```js\n'+output+'```')
				.setColor('#66FF00')
				.setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
				.setTimestamp()
		} catch (e) {
			embed
				.setTitle('❌ Code was not able to be evaled')
				.addField('📥 Input', code.length > 1012 ? 'Too large to display. Hastebin: ' + await this.client.consts.haste(code) : '```js\n'+code+'```')
				.addField('📤 Output', e.length > 1012 ? 'Too large to display. Hastebin: ' + await this.client.consts.haste(e) : '```js\n'+e+'```')
				.setColor('#FF0000')
				.setFooter(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
				.setTimestamp()
		}
		message.util.send(embed)
	}
}
