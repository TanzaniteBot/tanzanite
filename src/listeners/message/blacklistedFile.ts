import { BushListener, type BushClientEvents } from '#lib';
import * as crypto from 'crypto';
import { ChannelType } from 'discord.js';
import got from 'got';

export default class BlacklistedFileListener extends BushListener {
	#blacklistedFiles: { hash: string[]; name: string; description: string }[] = [
		{
			hash: ['a0f5e30426234bc9d09306ffc9474422'],
			name: 'Play twice audio',
			description: 'weird audio files'
		},
		{
			hash: ['43e55abbcea67d9e6d7abfff944a8d0b'],
			name: 'Flashy loud jumpscare',
			description: 'flashy, loud gifs'
		},
		{
			hash: [
				'7a0831239e8c8368e96fb4cacd61b5f2',
				'3bdb44bf3702f15d118f04fa63b927a9',
				'b6e45619a68c0e20749edb2412590b15',
				'bb8a27047518a8a7e420509af0e9e0ed',
				'f8076cd51e1ddab4ceded26a764af160',
				'1757f0442b5e337bba0340f7b116e6f7',
				'f59185531f0dfa9bdd323b86f796c3bd',
				'2825d3d82af65de210e638911e49b3a2',
				'5256c3c18b367552e55e463a60af7760'
			],
			name: 'Discord crash video/gif',
			description: 'media that crashes discord'
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
		},
		{
			hash: ['5a5bfdf02a0224d3468499d099ec4eee'],
			name: 'Virus (or at least flags antiviruses)',
			description: 'viruses'
		}
	];

	public constructor() {
		super('blacklistedFile', {
			emitter: 'client',
			event: 'messageCreate',
			category: 'message'
		});
	}

	public override async exec(...[message]: BushClientEvents['messageCreate']) {
		if (!message.guild || !(await message.guild.hasFeature('blacklistedFile'))) return;
		// eslint-disable-next-line deprecation/deprecation
		const embedAttachments = message.embeds.filter((e) => ['image', 'video', 'gifv'].includes(e.type));
		const foundEmojis = [...message.content.matchAll(/<(?<animated>a?):\w+:(?<id>\d+)>/g)];
		if (message.attachments.size + embedAttachments.length + foundEmojis.length < 1) return;
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
				const blacklistData = this.#blacklistedFiles.find((h) => h.hash.some((h) => h === hash));
				if (blacklistData !== undefined) {
					foundFiles.push(blacklistData);
				}
			} catch {
				continue;
			}
		}
		for (const attachment of embedAttachments) {
			try {
				const req = await got.get(attachment.url!);
				const rawHash = crypto.createHash('md5');
				rawHash.update(req.rawBody.toString('binary'));
				const hash = rawHash.digest('hex');
				const blacklistData = this.#blacklistedFiles.find((h) => h.hash.some((h) => h === hash));
				if (blacklistData !== undefined) {
					foundFiles.push(blacklistData);
				}
			} catch {
				continue;
			}
		}
		for (const attachment of foundEmojis) {
			try {
				const req = await got.get(
					`https://cdn.discordapp.com/emojis/${attachment.groups?.id}.${attachment.groups?.animated === 'a' ? 'gif' : 'png'}`
				);
				const rawHash = crypto.createHash('md5');
				rawHash.update(req.rawBody.toString('binary'));
				const hash = rawHash.digest('hex');
				const blacklistData = this.#blacklistedFiles.find((h) => h.hash.some((h) => h === hash));
				if (blacklistData !== undefined) {
					foundFiles.push(blacklistData);
				}
			} catch {
				continue;
			}
		}
		if (foundFiles.length > 0) {
			try {
				for (let i = 0; i < foundFiles.length; i++) {
					if (foundFiles[i].name === 'Discord crash video' && !client.ownerID.includes(message.author.id)) {
						await message.member?.roles.add('748912426581229690');
					}
				}
				await message.delete();

				await message.util.send(
					`<@!${message.author.id}>, please do not send ${foundFiles.map((f) => f.description).join(' or ')}.`
				);
				if (message.channel.type === ChannelType.DM) return;
				void client.console.info(
					'blacklistedFile',
					`Deleted <<${foundFiles.map((f) => f.description).join(' and ')}>> sent by <<${message.author.tag}>> in ${
						message.channel.name
					}.`
				);
			} catch (e) {
				void message.util.send(
					`<@!${message.author.id}>, please do not send ${foundFiles.map((f) => f.description).join(' or ')}.`
				);
				void client.console.warn(
					'blacklistedFile',
					`Failed to delete <<${foundFiles.map((f) => f.description).join(' and ')}>> sent by <<${message.author.tag}>> in <<${
						message.channel.type === ChannelType.DM ? `${message.channel.recipient.tag}'s DMs` : message.channel.name
					}>>.`
				);
			}
		}
	}
}
