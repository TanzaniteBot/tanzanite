import { AllowedMentions, BushCommand, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import assert from 'assert';
import { highlightCommandArgs, highlightSubcommands } from './highlight-!.js';

export default class HighlightRemoveCommand extends BushCommand {
	public constructor() {
		super('highlight-remove', {
			aliases: [],
			category: 'utilities',
			description: highlightSubcommands.remove,
			args: [
				{
					id: 'word',
					description: highlightCommandArgs.remove[0].description,
					type: 'string',
					match: 'rest',
					prompt: highlightCommandArgs.remove[0].description,
					retry: highlightCommandArgs.remove[0].retry,
					optional: !highlightCommandArgs.remove[0].required,
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

		const res = await client.highlightManager.removeHighlight(message.guild.id, message.author.id, args.word);

		if (typeof res === 'string')
			return await message.util.reply({ content: `${util.emojis.error} ${res}`, allowedMentions: AllowedMentions.none() });
		else if (!res)
			return await message.util.reply({
				content: `${util.emojis.error} There was an error unhighlighting "${args.word}".`,
				allowedMentions: AllowedMentions.none()
			});

		return await message.util.reply({
			content: `${util.emojis.success} Successfully removed "${args.word}" from your highlight list.`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
