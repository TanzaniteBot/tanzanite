import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { MessageEmbed } from 'discord.js';

export default class IconCommand extends BushCommand {
	constructor() {
		super('icon', {
			aliases: ['icon', 'guildavatar', 'severicon', 'guildicon'],
			category: 'info',
			description: {
				content: "A command to get the server's icon",
				usage: ['icon'],
				examples: ['icon']
			},
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['EMBED_LINKS'], true),
			userPermissions: [],
			channel: 'guild',
			slash: true
		});
	}

	override async exec(message: BushMessage | BushSlashMessage) {
		const embed = new MessageEmbed()
			.setTimestamp()
			.setColor(util.colors.default)
			.setImage(
				message.guild!.iconURL({
					size: 2048,
					dynamic: true,
					format: 'png'
				})!
			)
			.setTitle(message.guild!.name);
		await message.util.reply({ embeds: [embed] });
	}
}
