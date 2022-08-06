import { AllowedMentions, BushCommand, emojis, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import assert from 'assert/strict';
import { highlightSubcommands } from './highlight-!.js';

export default class HighlightRemoveCommand extends BushCommand {
	public constructor() {
		super('highlight-remove', {
			aliases: [],
			category: 'utilities',
			description: highlightSubcommands.remove.description,
			args: [
				{
					id: 'word',
					description: highlightSubcommands.remove.options[0].description,
					type: 'string',
					match: 'rest',
					prompt: highlightSubcommands.remove.options[0].description,
					retry: highlightSubcommands.remove.options[0].retry,
					optional: !highlightSubcommands.remove.options[0].required,
					only: 'text',
					slashType: false
				}
			],
			usage: [],
			examples: [],
			clientPermissions: [],
			userPermissions: []
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { word: ArgType<'string'> }) {
		assert(message.inGuild());

		const res = await this.client.highlightManager.removeHighlight(message.guild.id, message.author.id, args.word);

		if (typeof res === 'string')
			return await message.util.reply({ content: `${emojis.error} ${res}`, allowedMentions: AllowedMentions.none() });
		else if (!res)
			return await message.util.reply({
				content: `${emojis.error} There was an error unhighlighting "${args.word}".`,
				allowedMentions: AllowedMentions.none()
			});

		return await message.util.reply({
			content: `${emojis.success} Successfully removed "${args.word}" from your highlight list.`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
