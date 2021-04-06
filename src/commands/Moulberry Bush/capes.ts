import { Message, MessageEmbed } from 'discord.js';
import got from 'got';
import { BushCommand } from '../../lib/extensions/BushCommand';

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

export default class CapesCommand extends BushCommand {
	constructor() {
		super('capes', {
			aliases: ['capes', 'cape'],
			category: "Moulberry's Bush",
			description: {
				content: 'A command to see what a cape look like.',
				usage: 'cape [cape]',
				examples: ['capes', 'cape space']
			},
			args: [
				{
					id: 'cape',
					type: 'string',
					prompt: {
						start: 'What cape would you like to see?',
						retry: '<:no:787549684196704257> Choose a cape to see.',
						optional: true
					},
					default: null
				}
			],
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES']
		});
	}
	async exec(message: Message, { cape }: { cape: string | null }): Promise<void> {
		const { tree: neuFileTree }: GithubTreeApi = await got
			.get('https://api.github.com/repos/Moulberry/NotEnoughUpdates/git/trees/master?recursive=1')
			.json();
		const capes = neuFileTree
			.map(f => ({
				match: f.path.match(
					/src\/main\/resources\/assets\/notenoughupdates\/capes\/(?<name>\w+)_preview\.png/
				),
				f
			}))
			.filter(f => f.match !== null);

		if (cape !== null) {
			const capeObj = capes.find(c => c.match.groups.name === cape);
			if (capeObj) {
				const embed = new MessageEmbed({
					title: `${cape} cape`
				});
				embed.setImage(
					`https://github.com/Moulberry/NotEnoughUpdates/raw/master/${capeObj.f.path}`
				);
				await message.util.reply(embed);
			} else {
				await message.util.reply('That cape appears to not exist :thinking:');
			}
		} else {
			const embeds = [];
			for (const capeObj of capes) {
				const embed = new MessageEmbed({
					title: `${capeObj.match.groups.name} cape`
				});
				embed.setImage(
					`https://github.com/Moulberry/NotEnoughUpdates/raw/master/${capeObj.f.path}`
				);
				embeds.push(embed);
			}
			await this.client.consts.paginate(message, embeds);
		}
	}
}
