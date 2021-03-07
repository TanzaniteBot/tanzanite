import { Message, MessageEmbed } from 'discord.js';
import got from 'got';
import { BotCommand } from '../../extensions/BotCommand';

export interface GithubFile {
	path: string;
	mode: string;
	type: string;
	sha: string;
	size: number;
	url: string;
}

export interface GithubBlob {
	encoding: string;
	content: string;
	sha: string;
	node_id: string;
	url: string;
	size: number;
}

export interface GithubTreeApi {
	sha: string;
	url: string;
	tree: GithubFile[];
	truncated: boolean;
}


export default class CapesCommand extends BotCommand {
	constructor() {
		super('capes', {
			aliases: ['capes', 'cape'],
			args: [
				{
					id: 'cape',
					default: null
				}
			]
		})
	}
	async exec(message: Message, { cape }: { cape: string|null }): Promise<void> {
		const { tree: neuFileTree }: GithubTreeApi = await got.get('https://api.github.com/repos/Moulberry/NotEnoughUpdates/git/trees/master?recursive=1').json()
		const capes = neuFileTree.map(f => ({
			match: f.path.match(/src\/main\/resources\/assets\/notenoughupdates\/capes\/(?<name>w+)_preview\.png/),
			f
		})).filter(f => f.match !== null)

		if (cape) {
			const capeObj = capes.find(c => c.match.groups.name === cape)
			if (capeObj) {
				const { url: imgURL }: GithubBlob = await got.get(capeObj.f.url).json()
				await message.util.reply(new MessageEmbed({
					title: `${cape} cape`,
					image: {
						url: imgURL
					}
				}))
			}
		} else {
			await message.util.reply('wip')
		}
	}
}