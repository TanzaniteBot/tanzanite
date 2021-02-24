import { Message } from 'discord.js';
import { BotCommand } from '../../extensions/BotCommand';
import got from 'got';
import crypto from 'crypto';

export default class HashCommand extends BotCommand {
	constructor() {
		super('hash', {
			aliases: ['hash'],
			description: {
				content: 'Gets the file hash of the given discord link',
				usage: 'hash <file url>',
				examples: [
					'hash https://media.discordapp.net/attachments/756532125443817594/814235003863957514/unknown.png'
				]
			},
			args: [
				{
					id: 'url'
				}
			]
		})
	}
	public async exec(message: Message, { url }: { url: string }): Promise<void> {
		try {
			const req = await got.get(url)
			const rawHash = crypto.createHash('md5')
			rawHash.update(req.rawBody.toString('binary'))
			const hash = rawHash.digest('hex')
			await message.reply(`\`${hash}\``)
		} catch {
			await message.reply('Unable to calculate hash.')
		}
	}
}