import { BotCommand, emojis, mappings, type CommandMessage, type SlashMessage } from '#lib';
import assert from 'assert/strict';

export default class GimmeRole extends BotCommand {
	public constructor() {
		super('gimmeRole', {
			aliases: ['gimme-role', 'gimme'],
			category: "Moulberry's Bush",
			description: 'Gives you role.',
			usage: ['gimme-role'],
			examples: ['gimme-role'],
			slash: false,
			channel: 'guild',
			clientPermissions: [],
			userPermissions: [],
			restrictedGuilds: [mappings.guilds["Moulberry's Bush"]]
		});
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		assert(message.inGuild() && message.member);
		assert(message.guildId === mappings.guilds["Moulberry's Bush"]);

		const roleId = '1016149863651622923';

		try {
			if (!message.guild.roles.cache.has(roleId)) {
				return await message.util.reply(`${emojis.error} Fucky wucky, the role does not exist.`);
			}

			if (message.member.roles.cache.has(roleId)) {
				await message.member.roles.remove(roleId);
				return await message.util.reply(`${emojis.success} Removed role.`);
			} else {
				await message.member.roles.add(roleId);
				return await message.util.reply(`${emojis.success} Added role.`);
			}
		} catch {
			return message.util.reply(`${emojis.error} Fucky wucky, an error occurred.`);
		}
	}
}
