import { Command } from 'discord-akairo'
import { MessageEmbed } from 'discord.js'
import { Message } from 'discord.js'
import { inspect } from 'util'
import BotClient from '../../client/BotClient'

const clean = text => {
	if (typeof (text) === 'string')
		return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
	else
		return text
}

export default class EvalCommand extends Command {
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
		const client = <BotClient> this.client
		const embed: MessageEmbed = new MessageEmbed()
		try {
			let output = eval(code)
			if (typeof output !== 'string') output = inspect(output, { depth: 0 })
			output = output.replaceAll(this.client.token, '[token ommited]')
			output = clean(output)
			embed
				.setTitle('✅ Evaled code succefully')
				.addField('📥 Input', code.length > 1012 ? 'Too large to display. Hastebin: ' + await client.consts.haste(code) : '```js\n'+code+'```')
				.addField('📤 Output', output.length > 1012 ? 'Too large to display. Hastebin: ' + await client.consts.haste(output) : '```js\n'+output+'```')
				.setColor('#66FF00')
				.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
				.setTimestamp()
		} catch (e) {
			embed
				.setTitle('❌ Code was not able to be evaled')
				.addField('📥 Input', code.length > 1012 ? 'Too large to display. Hastebin: ' + await client.consts.haste(code) : '```js\n'+code+'```')
				.addField('📤 Output', e.length > 1012 ? 'Too large to display. Hastebin: ' + await client.consts.haste(e) : '```js\n'+e+'```')
				.setColor('#FF0000')
				.setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
				.setTimestamp()
		}
		message.util.send(embed)
	}
}
