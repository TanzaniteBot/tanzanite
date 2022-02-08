import { AllowedMentions, BushCommand, Highlight, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import { Embed } from 'discord.js';
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

		return await message.util.reply({
			embeds: [new Embed().setTitle('Highlight List').setDescription(highlight.words.join('\n')).setColor(util.colors.default)],
			allowedMentions: AllowedMentions.none()
		});
	}
}
