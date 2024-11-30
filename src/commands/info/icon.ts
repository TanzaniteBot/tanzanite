import { BotCommand, colors, type CommandMessage, type SlashMessage } from '#lib';
import { EmbedBuilder, escapeMarkdown } from 'discord.js';
import assert from 'node:assert/strict';

export default class IconCommand extends BotCommand {
	public constructor() {
		super('icon', {
			aliases: ['icon', 'guildavatar', 'severicon', 'guildicon'],
			category: 'info',
			description: "A command to get the server's icon",
			usage: ['icon'],
			examples: ['icon'],
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: [],
			channel: 'guild',
			slash: true
		});
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		assert(message.inGuild());

		const embed = new EmbedBuilder()
			.setTimestamp()
			.setColor(colors.default)
			.setImage(
				message.guild.iconURL({
					size: 2048,
					extension: 'png'
				})
			)
			.setTitle(escapeMarkdown(message.guild.name));
		await message.util.reply({ embeds: [embed] });
	}
}
