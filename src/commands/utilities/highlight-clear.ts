import { AllowedMentions, BushCommand, ConfirmationPrompt, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import { highlightSubcommands } from './highlight-!.js';

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

		if (message.util.isSlashMessage(message)) await message.interaction.deferReply();

		const confirm = await ConfirmationPrompt.send(message, { content: `Are you sure you want to clear your highlight list?` });
		if (!confirm) return await message.util.reply(`${util.emojis.warn} You decided not to clear your highlight list.`);

		const success = await client.highlightManager.removeAllHighlights(message.author.id, message.guild.id);
		if (!success) return await message.util.reply(`${util.emojis.error} There was an error clearing your highlight list.`);

		return await message.util.reply({
			content: `${util.emojis.success} Successfully cleared your highlight list.`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
