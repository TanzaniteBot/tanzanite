import { MessageEmbed } from 'discord.js'
import { TextChannel } from 'discord.js'
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
					id: 'sudo',
					match: 'flag',
					flag: '--sudo'
				},
				{
					id: 'silent',
					match: 'flag',
					flag: '--silent',
				},
				{
					id: 'code',
					match: 'rest',
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

	public async exec(message: Message, { code, sudo, silent }: { code: string, sudo: boolean, silent:boolean }): Promise<void> {
		const embed: MessageEmbed = new MessageEmbed()
		const bad_phrases: string[] = ['delete', 'destroy']
		const generalLogChannel = <TextChannel> this.client.channels.cache.get(this.client.config.generalLogChannel)
		
		//start time stuff
		const date = new Date(),
			hour = date.getHours(),
			hour1 = (hour < 10 ? '0' : '') + hour,
			min  = date.getMinutes(),
			min1 = (min < 10 ? '0' : '') + min,
			sec  = date.getSeconds(),
			sec1 = (sec < 10 ? '0' : '') + sec
		//end time stuff

		const evalLog = `[${hour1}:${min1}:${sec1}] ${message.author.tag} just used eval in ${message.channel.id}.`
		console.log(evalLog)
		generalLogChannel.send(evalLog)

		if (/*message.author.id == '322862723090219008' && */bad_phrases.some(p => code.includes(p)) && !sudo) {
			message.util.send('This eval was blocked by '+/*IRONM00N */'smooth brain protection™.')
			return
		}

		/* eslint-disable @typescript-eslint/no-unused-vars */
		const me = message.member,
			member = message.member,
			bot = this.client,
			guild = message.guild,
			channel = message.channel
		/* eslint-enable @typescript-eslint/no-unused-vars */

		/*Silent Eval*/
		if (silent == true){
			try{
				let output
				output = eval(code)
				if (isPromise(output)) output = await output
				output = output.replace(new RegExp(this.client.token, 'g'), '[token omitted]')
				output = clean(output)
				message.react('✔')
			}catch(e){
				generalLogChannel.send(e)
				message.react('❌')
				return
			}

		/*Normal Eval*/	
		}else{
			try {
				let output
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
}
