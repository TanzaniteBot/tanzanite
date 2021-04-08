import { BushListener } from '../../lib/extensions/BushListener';
import { Message } from 'discord.js';
import { stripIndent } from 'common-tags';
import got from 'got';
import crypto from 'crypto';
import log from '../../lib/utils/log';

export default class BlacklistedFileListener extends BushListener {
	private blacklistedFiles = [
		{
			hash: ['a0f5e30426234bc9d09306ffc9474422'],
			name: 'Play twice audio',
			description: 'weird audio files'
		},
		{
			hash: [
				'7a0831239e8c8368e96fb4cacd61b5f2',
				'3bdb44bf3702f15d118f04fa63b927a9',
				'b6e45619a68c0e20749edb2412590b15',
				'bb8a27047518a8a7e420509af0e9e0ed',
				'f8076cd51e1ddab4ceded26a764af160',
				'1757f0442b5e337bba0340f7b116e6f7'
			],
			name: 'Discord crash video',
			description: 'videos that crash discord'
		},
		{
			hash: ['1fd6b3f255946236fd55d3e4bef01c5f', '157d374ec41adeef9601fd87e23f4bf5'],
			name: 'Repost lobster video',
			description: 'images encouraging spam'
		},
		{
			hash: ['10ad124fc47cd9b7de2ec629bc945bf2'],
			name: 'Jarvis message top user troll thingy',
			description: 'gifs encouraging spam'
		},
		{
			hash: ['312cda77d3e1f5fa00f482aed3b36f6f'],
			name: 'Discord token stealer',
			description: 'discord token stealers'
		},
		{
			hash: ['f37f772246db9d690dee0f581682dfb7'],
			name: 'Weird nsfw dog vid',
			description: 'weird nsfw videos'
		}
	];
	private guildWhitelist = [
		'516977525906341928' // MB Bush
	];
	constructor() {
		super('blacklistedFiles', {
			event: 'message',
			emitter: 'client',
			category: 'message'
		});
	}
	public async exec(message: Message): Promise<void> {
		if (!this.guildWhitelist.includes(message.guild?.id)) return;
		const embedAttachments = message.embeds.filter(e => ['image', 'video'].includes(e.type));
		if (message.attachments.size + embedAttachments.length < 1) return;
		const foundFiles = [] as {
			name: string;
			hash: string[];
			description: string;
		}[];
		for (const attachment of message.attachments) {
			try {
				const req = await got.get(attachment[1].proxyURL);
				const rawHash = crypto.createHash('md5');
				rawHash.update(req.rawBody.toString('binary'));
				const hash = rawHash.digest('hex');
				const blacklistData = this.blacklistedFiles.find(h => h.hash.some(h => h === hash));
				if (blacklistData !== undefined) {
					foundFiles.push(blacklistData);
				}
			} catch {
				continue;
			}
		}
		for (const attachment of embedAttachments) {
			try {
				const req = await got.get(attachment.url);
				const rawHash = crypto.createHash('md5');
				rawHash.update(req.rawBody.toString('binary'));
				const hash = rawHash.digest('hex');
				const blacklistData = this.blacklistedFiles.find(h => h.hash.some(h => h === hash));
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
				if(foundFiles.name === 'Discord crash video'){
					message.member.roles.add('748912426581229690')
				}
				await message.channel.send(`<@!${message.author.id}>, please do not send ${foundFiles.map(f => f.description).join(' or ')}.`);
				await this.client.log({
					embed: {
						title: `Blacklisted ${foundFiles.length === 1 ? 'file' : 'files'} deleted`,
						description: stripIndent`
							Blacklisted ${foundFiles.length === 1 ? 'file was' : 'files were'} deleted in ${message.channel}.
							Author: <@!${message.author.id}> (${message.author.tag})
							Files found: ${foundFiles.map(f => `${f.name} (${f.hash})`).reduce((p, c, i) => (i == foundFiles.length - 1 ? `${p}, and ${c}` : `${p}, ${c}`))}
						`,
						color: this.client.consts.Red
					}
				});
				if (this.client.config.info) {
					if (message.channel.type === 'dm') return;
					log.info('BlacklistedFile', `Deleted <<${foundFiles.map(f => f.description).join(' and ')}>> sent by <<${message.author.tag}>> in ${message.channel.name}.`);
				}
			} catch (e) {
				await message.channel.send(`<@!${message.author.id}>, please do not send ${foundFiles.map(f => f.description).join(' or ')}.`);
				await this.client.log({
					embed: {
						title: `Blacklisted ${foundFiles.length === 1 ? 'file' : 'files'} sent`,
						description: stripIndent`
							Blacklisted ${foundFiles.length === 1 ? 'file was' : 'files were'} sent in ${message.channel}.
							Author: <@!${message.author.id}> (${message.author.tag})
							Files found: ${foundFiles.map(f => `${f.name} (${f.hash})`).reduce((p, c, i) => (i == foundFiles.length - 1 ? `${p}, and ${c}` : `${p}, ${c}`))}

							Unable to delete file, an error occurred. (${await this.client.consts.haste(e.stack)})
						`,
						color: this.client.consts.ErrorColor
					}
				});
				if (message.channel.type === 'dm') return;
				log.warn(
					'BlacklistedFile',
					`Failed to delete <<${foundFiles.map(f => f.description).join(' and ')}>> sent by <<${message.author.tag}>> in <<${message.channel.name}>>.`
				);
			}
		}
	}
}
