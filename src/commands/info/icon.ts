import { BushCommand, type CommandMessage, type SlashMessage } from '#lib';
import assert from 'assert';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default class IconCommand extends BushCommand {
	public constructor() {
		super('icon', {
			aliases: ['icon', 'guildavatar', 'severicon', 'guildicon'],
			category: 'info',
			description: "A command to get the server's icon",
			usage: ['icon'],
			examples: ['icon'],
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: [],
			channel: 'guild',
			slash: true
		});
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		assert(message.inGuild());

		const embed = new EmbedBuilder()
			.setTimestamp()
			.setColor(util.colors.default)
			.setImage(
				message.guild.iconURL({
					size: 2048,
					extension: 'png'
				})!
			)
			.setTitle(util.discord.escapeMarkdown(message.guild.name));
		await message.util.reply({ embeds: [embed] });
	}
}
