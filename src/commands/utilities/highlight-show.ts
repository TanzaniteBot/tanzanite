import { AllowedMentions, BushCommand, Highlight, type BushMessage, type BushSlashMessage } from '#lib';
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

	public override async exec(message: BushMessage | BushSlashMessage) {
		assert(message.inGuild());

		const [highlight] = await Highlight.findOrCreate({
			where: {
				guild: message.guild.id,
				user: message.author.id
			}
		});

		void client.highlightManager.syncCache();

		if (!highlight.words.length) return message.util.reply(`${util.emojis.error} You are not highlighting any words.`);

		const embed = new EmbedBuilder()
			.setTitle('Highlight List')
			.setDescription(
				highlight.words
					.map((hl) => (hl.regex ? `/${hl.word}/gi` : hl.word))
					.join('\n')
					.substring(0, 4096)
			)
			.setColor(util.colors.default);

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
