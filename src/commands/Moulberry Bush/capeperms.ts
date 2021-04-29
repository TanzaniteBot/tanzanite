import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message, MessageEmbed } from 'discord.js';
import functions from '../../constants/functions';
import got from 'got/dist/source';

export default class CapePermCommand extends BushCommand {
	private nameMap = {
		patreon1: 'Patreon Tier 1',
		patreon2: 'Patreon Tier 2',
		fade: 'Fade',
		contrib: 'Contributor',
		nullzee: 'Patreon Tier 1',
		gravy: 'Patreon Tier 1',
		space: 'Patreon Tier 1',
		mcworld: 'Patreon Tier 1',
		lava: 'Patreon Tier 1',
		packshq: 'Patreon Tier 1',
		mbstaff: 'Patreon Tier 1',
		thebakery: 'Patreon Tier 1',
		negative: 'Patreon Tier 1',
		void: 'Patreon Tier 1',
		ironmoon: 'Patreon Tier 1',
		krusty: 'Patreon Tier 1',
		furf: 'Patreon Tier 1',
		soldier: 'Patreon Tier 1',
		dsm: 'Patreon Tier 1',
		zera: 'Patreon Tier 1',
		tunnel: 'Patreon Tier 1',
		alexxoffi: 'Patreon Tier 1',
		parallax: 'Patreon Tier 1',
		jakethybro: 'Patreon Tier 1',
		planets: 'Patreon Tier 1'
	};
	public constructor() {
		super('capeperms', {
			aliases: ['capeperms', 'capeperm'],
			category: "Moulberry's Bush",
			description: {
				content: 'A command to see what capes someone has access to.',
				usage: 'capeperms <user>',
				examples: ['capeperms IRONM00N']
			},
			args: [
				{
					id: 'user',
					type: 'string',
					prompt: {
						start: 'Who would you like to see the cape permissions of?',
						retry: '<:no:787549684196704257> Choose someone to see the capes their available capes.',
						optional: false
					}
				}
			],
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			channel: 'guild'
		});
	}
	public async exec(message: Message, { user }: { user: string }): Promise<Message> {
		interface Capeperms {
			success: boolean;
			perms: User[];
		}
		interface User {
			_id: string;
			perms: string[];
		}

		if (message.guild.id !== '516977525906341928' && !this.client.ownerID.includes(message.author.id)) {
			return message.util.reply("<:no:787549684196704257> This command can only be run in Moulberry's Bush.");
		}

		let capeperms: Capeperms, uuid: string;
		try {
			uuid = await functions.findUUID(user);
		} catch (e) {
			return message.util.reply(`<:no:787549684196704257> \`${user}\` doesn't appear to be a valid username.`);
		}

		try {
			capeperms = await JSON.parse((await got.get('http://moulberry.codes/permscapes.json')).body);
		} catch (error) {
			capeperms = null;
		}
		if (capeperms == null) {
			return message.util.reply(`<:no:787549684196704257> There was an error finding cape perms for \`${user}\`.`);
		} else {
			if (capeperms?.perms) {
				let index = null;

				for (let i = 0; i < capeperms.perms.length; i++) {
					if (capeperms.perms[i]._id == uuid) {
						index = i;
						break;
					}
					continue;
				}
				if (index == null) return message.util.reply(`<:no:787549684196704257> ${user} Does not appear to have any capes.`);
				const userPerm: string[] = capeperms.perms[index].perms;
				const embed = new MessageEmbed().setTitle(`${user}'s Capes`).setDescription(userPerm.join('\n')).setColor(this.client.consts.DefaultColor);
				await message.util.reply(embed);
			} else {
				return message.util.reply(`<:no:787549684196704257> There was an error finding cape perms for ${user}.`);
			}
		}
	}
}
