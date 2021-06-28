import { Constants } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import got from 'got';
import { BushCommand } from '../../lib/extensions/BushCommand';
import { BushMessage } from '../../lib/extensions/BushMessage';

export default class CapePermissionsCommand extends BushCommand {
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
		super('capepermissions', {
			aliases: ['capeperms', 'capeperm', 'capepermissions'],
			category: "Moulberry's Bush",
			description: {
				content: 'A command to see what capes someone has access to.',
				usage: 'capeperms <user>',
				examples: ['capeperms IRONM00N']
			},
			args: [
				{
					id: 'ign',
					type: Constants.ArgumentTypes.STRING,
					match: Constants.ArgumentMatches.PHRASE,
					prompt: {
						start: 'Who would you like to see the cape permissions of?',
						retry: '{error} Choose someone to see the capes their available capes.',
						optional: false
					}
				}
			],
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			channel: 'guild',
			slash: true,
			slashOptions: [
				{
					name: 'ign',
					description: 'The ign of the player you would like to view the capes permissions of.',
					type: 'STRING',
					required: true
				}
			]
		});
	}

	public async exec(message: BushMessage, args: { ign: string }): Promise<unknown> {
		interface Capeperms {
			success: boolean;
			perms: User[];
		}

		interface User {
			_id: string;
			perms: string[];
		}

		let capeperms: Capeperms, uuid: string;
		try {
			uuid = await this.client.util.mcUUID(args.ign);
		} catch (e) {
			return await message.util.reply(
				`${this.client.util.emojis.error} \`${args.ign}\` doesn't appear to be a valid username.`
			);
		}

		try {
			capeperms = await got.get('https://moulberry.codes/permscapes.json').json();
		} catch (error) {
			capeperms = null;
		}
		if (capeperms == null) {
			return await message.util.reply(
				`${this.client.util.emojis.error} There was an error finding cape perms for \`${args.ign}\`.`
			);
		} else {
			if (capeperms?.perms) {
				let index = null;

				for (let i = 0; i < capeperms.perms.length; i++) {
					if (capeperms.perms[i]._id == uuid) {
						index = i;
						break;
					}
				}
				if (index == null)
					return await message.util.reply(
						`${this.client.util.emojis.error} \`${args.ign}\` does not appear to have any capes.`
					);
				const userPerm: string[] = capeperms.perms[index].perms;
				const embed = new MessageEmbed()
					.setTitle(`${args.ign}'s Capes`)
					.setDescription(userPerm.join('\n'))
					.setColor(this.client.util.colors.default);
				await message.util.reply({ embeds: [embed] });
			} else {
				return await message.util.reply(
					`${this.client.util.emojis.error} There was an error finding cape perms for ${args.ign}.`
				);
			}
		}
	}
}
