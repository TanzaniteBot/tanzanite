import { AllowedMentions, BushCommand, colors, emojis, Highlight, type CommandMessage, type SlashMessage } from '#lib';
import assert from 'assert';
import { EmbedBuilder } from 'discord.js';
import { highlightSubcommands } from './highlight-!.js';

export default class HighlightShowCommand extends BushCommand {
	public constructor() {
		super('highlight-show', {
			aliases: [],
			category: 'utilities',
			description: highlightSubcommands.show,
			usage: [],
			examples: [],
			clientPermissions: [],
			userPermissions: []
		});
	}

	public override async exec(message: CommandMessage | SlashMessage) {
		assert(message.inGuild());

		const [highlight] = await Highlight.findOrCreate({
			where: { guild: message.guild.id, user: message.author.id }
		});

		void this.client.highlightManager.syncCache();

		if (!highlight.words.length) return message.util.reply(`${emojis.error} You are not highlighting any words.`);

		const embed = new EmbedBuilder()
			.setTitle('Highlight List')
			.setDescription(
				highlight.words
					.map((hl) => (hl.regex ? `/${hl.word}/gi` : hl.word))
					.join('\n')
					.substring(0, 4096)
			)
			.setColor(colors.default);

		if (highlight.blacklistedChannels.length)
			embed.addFields([
				{
					name: 'Ignored Channels',
					value: highlight.blacklistedChannels
						.map((c) => `<#${c}>`)
						.join('\n')
						.substring(0, 1024),
					inline: true
				}
			]);
		if (highlight.blacklistedUsers.length)
			embed.addFields([
				{
					name: 'Ignored Users',
					value: highlight.blacklistedUsers
						.map((u) => `<@!${u}>`)
						.join('\n')
						.substring(0, 1024),
					inline: true
				}
			]);

		return await message.util.reply({
			embeds: [embed],
			allowedMentions: AllowedMentions.none()
		});
	}
}
