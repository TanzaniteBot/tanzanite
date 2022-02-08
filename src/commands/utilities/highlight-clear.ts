import { AllowedMentions, BushCommand, ConfirmationPrompt, Highlight, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import { highlightSubcommands } from './highlight-!';

export default class HighlightClearCommand extends BushCommand {
	public constructor() {
		super('highlight-clear', {
			aliases: [],
			category: 'utilities',
			description: highlightSubcommands.clear,
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

		const confirm = await ConfirmationPrompt.send(message, { content: `Are you sure you want to clear your highlight list?` });
		if (!confirm) return await message.util.reply(`${util.emojis.warn} You decided not to clear your highlight list.`);

		highlight.words = [];
		await highlight.save();

		return await message.util.reply({
			content: `${util.emojis.success} Successfully cleared your highlight list.`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
