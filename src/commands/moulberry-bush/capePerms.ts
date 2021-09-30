import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { MessageEmbed } from 'discord.js';
import got from 'got';

export default class CapePermissionsCommand extends BushCommand {
	public constructor() {
		super('capePermissions', {
			aliases: ['cape-perms', 'cape-perm', 'cape-permissions'],
			category: "Moulberry's Bush",
			description: {
				content: 'A command to see what capes someone has access to.',
				usage: 'cape-perms <user>',
				examples: ['cape-perms IRONM00N']
			},
			args: [
				{
					id: 'ign',
					type: 'string',
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

	public override async exec(message: BushMessage | BushSlashMessage, args: { ign: string }): Promise<unknown> {
		interface Capeperms {
			success: boolean;
			perms: User[];
		}

		interface User {
			_id: string;
			perms: string[];
		}

		let capeperms: Capeperms | null, uuid: string;
		try {
			uuid = await util.findUUID(args.ign);
		} catch (e) {
			return await message.util.reply(`${util.emojis.error} \`${args.ign}\` doesn't appear to be a valid username.`);
		}

		try {
			capeperms = await got.get('http://moulberry.codes/permscapes.json').json();
		} catch (error) {
			capeperms = null;
		}
		if (capeperms == null) {
			return await message.util.reply(`${util.emojis.error} There was an error finding cape perms for \`${args.ign}\`.`);
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
				if (index == null)
					return await message.util.reply(`${util.emojis.error} \`${args.ign}\` does not appear to have any capes.`);
				const userPerm: string[] = capeperms.perms[index].perms;
				const embed = new MessageEmbed()
					.setTitle(`${args.ign}'s Capes`)
					.setDescription(userPerm.join('\n'))
					.setColor(util.colors.default);
				await message.util.reply({ embeds: [embed] });
			} else {
				return await message.util.reply(`${util.emojis.error} There was an error finding cape perms for ${args.ign}.`);
			}
		}
	}
}
