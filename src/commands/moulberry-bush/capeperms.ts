import { Message } from 'discord.js';
import got from 'got';
import { BotCommand } from '../../lib/extensions/BotCommand';

interface Capeperms {
	success: boolean;
	perms: User[];
}
interface User {
	_id: string;
	perms: string[];
}

export default class CapePermsCommand extends BotCommand {
	private nameMap = {
		patreon1: 'Patreon Tier 1',
		patreon2: 'Patreon Tier 2',
		fade: 'Fade',
		contrib: 'Contributor',
		nullzee: 'Nullzee',
		gravy: 'ThatGravyBoat',
		space: 'Space',
		mcworld: 'Minecraft World',
		lava: 'Lava',
		packshq: 'PacksHQ',
		mbstaff: "Moulberry's Bush staff",
		thebakery: "Biscuit's Bakery",
		negative: 'Negative',
		void: 'Void',
		ironmoon: 'IRONM00N',
		krusty: 'Krusty',
		furf: 'FurfSky Reborn',
		soldier: 'Soldier',
		dsm: "Danker's Skyblock Mod",
		zera: 'Zera',
		tunnel: 'Tunnel',
		alexxoffi: 'Alexxoffi',
		parallax: 'Parallax',
		jakethybro: 'Jakethybro',
		planets: 'Planets'
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
						retry:
							'<:error:837123021016924261> Choose someone to see the capes their available capes.',
						optional: false
					}
				}
			],
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			channel: 'guild'
		});
	}
	public async exec(
		message: Message,
		{ user }: { user: string }
	): Promise<Message> {
		let capeperms: Capeperms, uuid: string;
		try {
			uuid = await this.client.util.mcUUID(user);
		} catch (e) {
			return message.util.reply(
				`<:error:837123021016924261> \`${user}\` doesn't appear to be a valid username.`
			);
		}

		try {
			capeperms = await got
				.get('http://moulberry.codes/permscapes.json')
				.json();
		} catch (error) {
			capeperms = null;
		}
		if (capeperms == null) {
			return message.util.reply(
				`<:error:837123021016924261> There was an error finding cape perms for \`${user}\`.`
			);
		} else {
			if (capeperms?.perms) {
				const foundUser = capeperms.perms.find((u) => u._id === uuid);
				if (foundUser == null)
					return message.util.reply(
						`<:error:837123021016924261> \`${user}\` does not appear to have any capes.`
					);
				const userPerm: string[] = foundUser.perms;
				const embed = this.client.util
					.createEmbed(this.client.util.colors.default)
					.setTitle(`${user}'s Capes`)
					.setDescription(userPerm.join('\n'));
				await message.util.reply(embed);
			} else {
				return message.util.reply(
					`<:error:837123021016924261> There was an error finding cape perms for ${user}.`
				);
			}
		}
	}
}
