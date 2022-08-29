import {
	AllowedMentions,
	BotCommand,
	clientSendAndPermCheck,
	colors,
	emojis,
	format,
	mcUUID,
	type ArgType,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default class CapePermissionsCommand extends BotCommand {
	public constructor() {
		super('capePermissions', {
			aliases: ['cape-permissions', 'cape-perms', 'cape-perm'],
			category: "Moulberry's Bush",
			description: 'A command to see what capes someone has access to.',
			usage: ['cape-permissions <ign>'],
			examples: ['cape-permissions IRONM00N'],
			args: [
				{
					id: 'ign',
					description: 'The ign of the player you would like to view the capes permissions of.',
					type: 'string',
					prompt: 'Who would you like to see the cape permissions of?',
					retry: '{error} Choose someone to see the capes their available capes.',
					slashType: ApplicationCommandOptionType.String
				}
			],
			slash: true,
			clientPermissions: (m) => clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: [],
			channel: 'guild'
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { ign: ArgType<'string'> }) {
		let capePerms: CapePerms | null, uuid: string;
		try {
			uuid = await mcUUID(args.ign);
		} catch (e) {
			return await message.util.reply({
				content: `${emojis.error} ${format.input(args.ign)} doesn't appear to be a valid username.`,
				allowedMentions: AllowedMentions.none()
			});
		}

		try {
			capePerms = await fetch('http://moulberry.codes/permscapes.json').then((p) => (p.ok ? p.json() : null));
		} catch (error) {
			capePerms = null;
		}
		if (capePerms == null) {
			return await message.util.reply(`${emojis.error} There was an error finding cape perms for ${format.input(args.ign)}.`);
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
					return await message.util.reply(`${emojis.error} ${format.input(args.ign)} does not appear to have any capes.`);
				const userPerm: string[] = capePerms.perms[index].perms;
				const embed = new EmbedBuilder()
					.setTitle(`${args.ign}'s Capes`)
					.setDescription(userPerm.join('\n'))
					.setColor(colors.default);
				await message.util.reply({ embeds: [embed] });
			} else {
				return await message.util.reply(`${emojis.error} There was an error finding cape perms for ${args.ign}.`);
			}
		}
	}
}

interface CapePerms {
	success: boolean;
	perms: User[];
}

interface User {
	_id: string;
	perms: string[];
}
