import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message } from 'discord.js';
import { MessageEmbed } from 'discord.js';

export default class IconCommand extends BushCommand {
	constructor() {
		super('icon', {
			aliases: ['icon', 'guildavatar', 'severicon', 'guildicon'],
			category: 'utils',
			description: {
				content: "A command to get the server's icon",
				usage: 'icon',
				examples: 'icon'
			},
			clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS'],
			channel: 'guild'
		});
	}

	async exec(message: Message): Promise<void> {
		const embed = new MessageEmbed()
			.setTimestamp()
			.setColor(this.client.consts.DefaultColor)
			.setImage(
				message.guild?.iconURL({
					size: 2048,
					dynamic: true,
					format: 'png'
				})
			)
			.setTitle(message.guild.name);
		await message.util.reply(embed);
	}
}
