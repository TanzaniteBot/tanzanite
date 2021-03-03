import { BotListener } from '../../extensions/BotListener';
import { Message } from 'discord.js';
import { stripIndent } from 'common-tags';
import got from 'got';
import crypto from 'crypto';

export default class BlacklistedFileListener extends BotListener {
	private blacklistedFiles = [
		{
			hash: ['a0f5e30426234bc9d09306ffc9474422'],
			name: 'Play twice audio',
			description: 'weird audio files'
		},
		{
			hash: ['7a0831239e8c8368e96fb4cacd61b5f2'],
			name: 'Web/Desktop crash video',
			description: 'videos that crash discord'
		},
		{
			hash: ['1fd6b3f255946236fd55d3e4bef01c5f', '157d374ec41adeef9601fd87e23f4bf5'],
			name: 'Repost lobster video',
			description: 'images encouraging spam'
		}
	];
	constructor() {
		super('blacklistedFiles', {
			event: 'message',
			emitter: 'client',
			category: 'message',
		});
	}
	public async exec(message: Message): Promise<void> {
		if (message.attachments.size < 1) return;
		const foundFiles = [] as { name: string; hash: string[]; description: string }[];
		for (const attachment of message.attachments) {
			try {
				const req = await got.get(attachment[1].proxyURL);
				const rawHash = crypto.createHash('md5');
				rawHash.update(req.rawBody.toString('binary'));
				const hash = rawHash.digest('hex');
				const blacklistData = this.blacklistedFiles.find((h) => h.hash.some(h => h === hash));
				if (blacklistData !== undefined) {
					foundFiles.push(blacklistData);
				}
			} catch {
				continue;
			}
		}
		if (foundFiles.length > 0) {
			try {
				await message.delete();
				await message.channel.send(`<@!${message.author.id}>, please do not send ${foundFiles.map(f => f.description).join(' or ')}.`);
				await this.client.log({
					embed: {
						title: `Blacklisted ${foundFiles.length === 1 ? 'file' : 'files'} deleted`,
						description: stripIndent`
							Blacklisted ${foundFiles.length === 1 ? 'file was' : 'files were'} deleted in ${message.channel}.
							Author: <@!${message.author.id}> (${message.author.tag})
							Files found: ${foundFiles.map((f) => `${f.name} (${f.hash})`).reduce((p, c, i) => (i == foundFiles.length - 1 ? `${p}, and ${c}` : `${p}, ${c}`))}
						`,
						color: this.client.consts.Red,
					},
				});
			} catch {
				await message.channel.send(`<@!${message.author.id}>, please do not send ${foundFiles.map(f => f.description).join(' or ')}.`);
				await this.client.log({
					embed: {
						title: `Blacklisted ${foundFiles.length === 1 ? 'file' : 'files'} sent`,
						description: stripIndent`
							Blacklisted ${foundFiles.length === 1 ? 'file was' : 'files were'} sent in ${message.channel}.
							Author: <@!${message.author.id}> (${message.author.tag})
							Files found: ${foundFiles.map((f) => `${f.name} (${f.hash})`).reduce((p, c, i) => (i == foundFiles.length - 1 ? `${p}, and ${c}` : `${p}, ${c}`))}

							Unable to delete file, an error occurred.
						`,
						color: this.client.consts.ErrorColor,
					},
				});
			}
		}
	}
}
