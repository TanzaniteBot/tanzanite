import { BotListener } from '../../extensions/BotListener';
import { Message } from 'discord.js';
import { stripIndent } from 'common-tags';
import got from 'got';
import crypto from 'crypto';

export default class BlacklistedFileListener extends BotListener {
	private blacklistedFiles = [
		{
			hash: 'a0f5e30426234bc9d09306ffc9474422',
			name: 'Play twice audio'
		},
		{
			hash: '7a0831239e8c8368e96fb4cacd61b5f2',
			name: 'Web/Desktop crash video'
		}
	]
	constructor() {
		super('blacklistedFiles', {
			event: 'message',
			emitter: 'client',
			category: 'message'
		})
	}
	public async exec(message: Message): Promise<void> {
		if (message.attachments.size < 1) return
		const foundFiles = [] as {name: string; hash: string}[]
		for (const attachment of message.attachments) {
			try {
				const req = await got.get(attachment[1].proxyURL)
				const rawHash = crypto.createHash('md5')
				rawHash.update(req.rawBody.toString('binary'))
				const hash = rawHash.digest('hex')
				const blacklistData = this.blacklistedFiles.find(h => h.hash === hash)
				if (blacklistData !== undefined) {
					foundFiles.push(blacklistData)
				}
			} catch {
				continue
			}
		}
		if (foundFiles.length > 0) {
			try {
				await message.delete()
				await this.client.log({
					embed: {
						title: `Blacklisted ${foundFiles.length === 1 ? 'file' : 'files'} deleted`,
						description: stripIndent`
							Blacklisted ${foundFiles.length === 1 ? 'file was' : 'files were'} deleted in ${message.channel}.
							Author: <@!${message.author.id}> (${message.author.tag})
							Files found: ${foundFiles.map(f => `${f.name} (${f.hash})`).reduce((p, c, i) => i == foundFiles.length - 1 ? `${p}, and ${c}` : `${p}, ${c}`)}
						`,
						color: this.client.consts.Red
					}
				})
			} catch {
				await this.client.log({
					embed: {
						title: `Blacklisted ${foundFiles.length === 1 ? 'file' : 'files'} sent`,
						description: stripIndent`
							Blacklisted ${foundFiles.length === 1 ? 'file was' : 'files were'} sent in ${message.channel}.
							Author: <@!${message.author.id}> (${message.author.tag})
							Files found: ${foundFiles.map(f => `${f.name} (${f.hash})`).reduce((p, c, i) => i == foundFiles.length - 1 ? `${p}, and ${c}` : `${p}, ${c}`)}

							Unable to delete file, an error occurred.
						`,
						color: this.client.consts.ErrorColor
					}
				})
			}
		}
	}
}