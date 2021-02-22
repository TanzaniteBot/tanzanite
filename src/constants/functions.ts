import { MessageEmbed, TextChannel, Message } from 'discord.js';
import BotClient from '../extensions/BotClient';
import got from 'got';
import { globalOptionsSchema, guildOptionsSchema, userOptionsSchema } from '../extensions/mongoose';

interface hastebinRes {
	key: string;
}

async function runIfCan(func, ...args) {
	try {
		await func(...args);
	} catch {
		// pass
	}
}

async function reactAll(m: Message, ...relations: string[]) {
	for (const reaction of relations) {
		await m.react(reaction);
	}
}

async function haste(content: string): Promise<string> {
	const urls = [
		'https://hst.sh',
		'https://hasteb.in',
		'https://hastebin.com',
		'https://mystb.in',
		'https://haste.clicksminuteper.net',
		'https://paste.pythondiscord.com',
		'https://haste.unbelievaboat.com',
	];
	for (const url of urls) {
		try {
			const res: hastebinRes = await got.post(`${url}/documents`, { body: content }).json();
			return url + '/' + res.key;
		} catch (e) {
			continue;
		}
	}
	return 'Unable to post';
}

async function paginate(message: Message, embeds: MessageEmbed[]): Promise<void> {
	embeds.forEach((_e, i) => {
		embeds[i] = embeds[i].setFooter(`Page ${i + 1}/${embeds.length} | Click ❔ for help!`);
	});
	let curPage = 0;
	if (typeof embeds !== 'object') return;
	const m = await message.channel.send(embeds[curPage]);
	const paginatorReactions = ['⏪', '◀', '⏹', '▶', '⏩', '🔢', '❔'];
	await reactAll(m, ...paginatorReactions);
	const filter = (r) => paginatorReactions.includes(r.emoji.toString());
	const coll = m.createReactionCollector(filter);
	const timeOut = async () => {
		await m.edit('Timed out.', { embed: null });
		await runIfCan(m.reactions.removeAll);
		coll.stop();
	};
	let timeout = setTimeout(timeOut, 300000);
	coll.on('collect', async (r, u) => {
		if (u.id == message.client.user.id) return;
		const userReactions = m.reactions.cache.filter((reaction) => reaction.users.cache.has(u.id));
		for (const reaction of userReactions.values()) {
			await runIfCan(reaction.users.remove, u.id);
		}
		if (u.id != message.author.id) return;
		clearTimeout(timeout);
		timeout = setTimeout(timeOut, 300000);
		switch (r.emoji.toString()) {
			case '◀': {
				if (curPage - 1 < 0) return;
				if (!embeds[curPage - 1]) return;
				curPage--;
				await m.edit(embeds[curPage]);
				break;
			}

			case '▶': {
				if (!embeds[curPage + 1]) return;
				curPage++;
				await m.edit(embeds[curPage]);
				break;
			}

			case '⏹': {
				clearTimeout(timeout);
				await m.edit('Command closed by user.', { embed: null });
				await runIfCan(m.reactions.removeAll);
				coll.stop();
				break;
			}

			case '⏪': {
				curPage = 0;
				await m.edit(embeds[curPage]);
				break;
			}

			case '⏩': {
				curPage = embeds.length - 1;
				await m.edit(embeds[curPage]);
				break;
			}

			case '🔢': {
				const filter = (m) => m.author.id == message.author.id && !isNaN(Number(m.content));
				const m1 = await message.reply('What page would you like to see? (Must be a number)');
				message.channel
					.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
					.then(async (messages) => {
						const responseMessage: Message = messages.array()[0];
						const resp = Number(responseMessage.content);
						const embedChange = embeds[resp - 1] || null;
						if (embedChange === null) {
							const mErr = await message.channel.send('Invalid page.');
							await runIfCan(messages.array()[0].delete);
							setTimeout(async () => {
								await mErr.delete();
								await m1.delete();
							}, 10000);
							return;
						}
						curPage = resp - 1;
						await m.edit(embedChange);
						await runIfCan(messages.array()[0].delete);
						await m1.delete();
					})
					.catch(async () => {
						const mErr = await message.channel.send('Took too long.');
						setTimeout(async () => {
							await mErr.delete();
							await m1.delete();
						}, 10000);
					});
				break;
			}
			case '❔': {
				const embed4 = new MessageEmbed()
					.setTitle('Legend')
					.setDescription(
						'⏪: first page\n\n◀: previous page\n\n⏹: close command\n\n▶: next page\n\n⏩: last page\n\n🔢: page picker\n\n❔: toggle help menu'
					)
					.setColor(Math.floor(Math.random() * 16777216));
				const e = m.embeds[0];
				const isSame = e.title === embed4.title && e.footer === embed4.footer && e.description === embed4.description;
				if (isSame) {
					await m.edit(embeds[curPage]);
				} else {
					await m.edit(embed4);
				}
				break;
			}
		}
	});
}

function sleep(s: number): Promise<unknown> {
	return new Promise((resolve) => setTimeout(resolve, s * 1000));
}

async function replaceAsync(str: string, regex: RegExp, asyncFn) {
	const promises = [];
	str.replace(regex, (match, ...args) => {
		const promise = asyncFn(match, ...args);
		promises.push(promise);
		return '[placeholder]';
	});
	const data = await Promise.all(promises);
	return str.replace(regex, () => data.shift());
}

async function resolveMentions(client: BotClient, text: string): Promise<string> {
	text = await replaceAsync(text, /<#(\d+)>/g, async (match, ...args) => {
		const resolvedChannel = <TextChannel>await client.channels.fetch(args[0]);
		return resolvedChannel ? '#' + resolvedChannel.name : '#invalid-channel';
	});
	text = await replaceAsync(text, /<@[!@]?(\d+)>/g, async (match, ...args) => {
		const resolvedUser = await client.users.fetch(args[0]);
		return resolvedUser ? '@' + resolvedUser.tag : '@invalid-user';
	});
	return text;
}

function getRandomColor(): string {
	// noinspection SpellCheckingInspection
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function hexToRgb(hex: string): string {
	const arrBuff = new ArrayBuffer(4);
	const vw = new DataView(arrBuff);
	vw.setUint32(0,parseInt(hex, 16),false);
	const arrByte = new Uint8Array(arrBuff);

	return arrByte[1] + ', ' + arrByte[2] + ', ' + arrByte[3];
}

async function dbGet(type: 'global'|'guild'|'user', setting: string, other?: string): Promise<string | string[]>{ //only use other for guild and user, idk how to mark that properly 
	let data
	other == other ?? 'unknown'
	switch (type) {
		case 'global':
			data = await globalOptionsSchema.findOne({environment: (this.client as BotClient).config.environment})
			break;
		case 'guild':
			if (other  === 'unknown' ) {
				throw new Error('other is undefined')
			}
			data = await guildOptionsSchema.findOne({id: other})
			break;
		case 'user':
			if (other  === 'unknown' ) {
				throw new Error('other is undefined')
			}
			data = await userOptionsSchema.findOne({id: other})
			break;
	}
	if (data){
		if (data['settings']){
			return data['settings'][setting];
		}
	}
	return []
}

async function dbUpdate(type: 'global'|'guild'|'user', setting: string, newValue: string|string[], other?: string): Promise<void> {
	let data, a
	switch (type) {
		case 'global':
			data = await globalOptionsSchema.findOne({environment: this.client.config.environment})
			a = globalOptionsSchema
			break;
		case 'guild':
			if (other  === 'unknown' ) {
				throw new Error('other is undefined')
			}
			data = await guildOptionsSchema.findOne({id: other})
			a = guildOptionsSchema
			break;
		case 'user':
			if (other  === 'unknown' ) {
				throw new Error('other is undefined')
			}
			data = await userOptionsSchema.findOne({id: other})
			a = userOptionsSchema
			break;
	}
	if (!(data['_id'])){
		if (type === 'guild'){
			const attributes = {}
			attributes[setting] = newValue
			const Query2 = new a({
				id: other, 
				attributes
			})
			await Query2.save()
		}
	}
	const settings = {}
	settings[setting] = newValue
	const Query = await a.findByIDAndUpdate(data['_id'], {settings})
	await Query.save()
	return 
}


export = {
	haste,
	paginate,
	sleep,
	resolveMentions,
	getRandomColor,
	hexToRgb,
	dbGet,
	dbUpdate,
};