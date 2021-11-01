import { BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import { MessageEmbed } from 'discord.js';
import got from 'got';

export default class CapePermissionsCommand extends BushCommand {
	public constructor() {
		super('capePermissions', {
			aliases: ['cape-perms', 'cape-perm', 'cape-permissions'],
			category: "Moulberry's Bush",
			description: {
				content: 'A command to see what capes someone has access to.',
				usage: ['cape-perms <user>'],
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
			slash: true,
			slashOptions: [
				{
					name: 'ign',
					description: 'The ign of the player you would like to view the capes permissions of.',
					type: 'STRING',
					required: true
				}
			],
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['EMBED_LINKS'], true),
			userPermissions: [],
			channel: 'guild'
		});
	}

	public override async exec(message: BushMessage | BushSlashMessage, args: { ign: string }) {
		interface CapePerms {
			success: boolean;
			perms: User[];
		}

		interface User {
			_id: string;
			perms: string[];
		}

		let capePerms: CapePerms | null, uuid: string;
		try {
			uuid = await util.findUUID(args.ign);
		} catch (e) {
			return await message.util.reply(`${util.emojis.error} \`${args.ign}\` doesn't appear to be a valid username.`);
		}

		try {
			capePerms = await got.get('http://moulberry.codes/permscapes.json').json();
		} catch (error) {
			capePerms = null;
		}
		if (capePerms == null) {
			return await message.util.reply(`${util.emojis.error} There was an error finding cape perms for \`${args.ign}\`.`);
		} else {
			if (capePerms?.perms) {
				let index = null;

				for (let i = 0; i < capePerms.perms.length; i++) {
					if (capePerms.perms[i]._id == uuid) {
						index = i;
						break;
					}
					continue;
				}
				if (index == null)
					return await message.util.reply(`${util.emojis.error} \`${args.ign}\` does not appear to have any capes.`);
				const userPerm: string[] = capePerms.perms[index].perms;
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
