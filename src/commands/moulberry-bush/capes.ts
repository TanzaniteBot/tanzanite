import { BushCommand, BushMessage, ButtonPaginator, DeleteButton } from '@lib';
import { MessageEmbedOptions } from 'discord.js';
import got from 'got';

export default class CapesCommand extends BushCommand {
	public constructor() {
		super('capes', {
			aliases: ['capes', 'cape'],
			category: "Moulberry's Bush",
			description: {
				content: 'A command to see what a cape looks like.',
				usage: ['cape [cape]'],
				examples: ['capes', 'cape space']
			},
			args: [
				{
					id: 'cape',
					type: 'string',
					prompt: {
						start: 'What cape would you like to see?',
						retry: '{error} Choose a cape to see.',
						optional: true
					},
					default: null
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'cape',
					description: 'What cape would you like to see?',
					type: 'STRING',
					required: false
				}
			],
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['EMBED_LINKS'], true),
			userPermissions: []
		});
	}

	public override async exec(message: BushMessage, args: { cape: string | null }) {
		const { tree: neuFileTree }: GithubTreeApi = await got
			.get('https://api.github.com/repos/Moulberry/NotEnoughUpdates/git/trees/master?recursive=1')
			.json();
		const capes = neuFileTree
			.map((f) => ({
				match: f.path.match(/src\/main\/resources\/assets\/notenoughupdates\/capes\/(?<name>\w+)_preview\.png/),
				f
			}))
			.filter((f) => f.match !== null);

		const capes1: { name: string; url: string; index: number; purchasable?: boolean }[] = [];
		client.consts.mappings.capes.forEach((mapCape) => {
			if (!capes.some((gitCape) => gitCape.match!.groups!.name === mapCape.name) && mapCape.custom) {
				capes1.push({ name: mapCape.name, url: mapCape.custom, index: mapCape.index, purchasable: mapCape.purchasable });
			}
		});
		capes.forEach((gitCape) => {
			const mapCape = client.consts.mappings.capes.find((a) => a.name === gitCape.match!.groups!.name);
			const url = mapCape?.custom ?? `https://github.com/Moulberry/NotEnoughUpdates/raw/master/${gitCape.f.path}`;
			const index = mapCape?.index !== undefined ? mapCape.index : null;
			capes1.push({ name: gitCape.match!.groups!.name, url, index: index!, purchasable: mapCape?.purchasable });
		});

		const sortedCapes = capes1.sort((a, b) => {
			let aWeight: number | undefined = undefined,
				bWeight: number | undefined = undefined;
			aWeight ??= a?.index;
			bWeight ??= b?.index;

			if (aWeight !== undefined && bWeight !== undefined) {
				return aWeight - bWeight;
			} else if (aWeight === undefined) {
				return 1;
			} else if (bWeight === undefined) {
				return -1;
			}
			return 0;
		});

		if (args.cape) {
			const cape = sortedCapes.find((s_cape) => s_cape.name === args.cape);
			if (cape) {
				const embed = this.makeEmbed(cape);
				await DeleteButton.send(message, { embeds: [embed] });
			} else {
				await message.util.reply(`${util.emojis.error} Cannot find a cape called \`${args.cape}\`.`);
			}
		} else {
			const embeds: MessageEmbedOptions[] = sortedCapes.map(this.makeEmbed);
			await ButtonPaginator.send(message, embeds, null);
		}
	}

	private makeEmbed(cape: {
		name: string;
		url: string;
		index: number;
		purchasable?: boolean | undefined;
	}): MessageEmbedOptions {
		return {
			title: `${cape.name} cape`,
			color: util.colors.default,
			timestamp: Date.now(),
			image: { url: cape.url },
			description: cape.purchasable ? ':money_with_wings: **purchasable** :money_with_wings:' : undefined
		};
	}
}

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
