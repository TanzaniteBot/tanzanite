import { AllowedMentions, BushCommand, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import assert from 'assert';
import { highlightCommandArgs, highlightSubcommands } from './highlight-!.js';

export default class HighlightAddCommand extends BushCommand {
	public constructor() {
		super('highlight-add', {
			aliases: [],
			category: 'utilities',
			description: highlightSubcommands.add,
			args: [
				{
					id: 'word',
					description: highlightCommandArgs.add[0].description,
					type: 'string',
					match: 'rest',
					prompt: highlightCommandArgs.add[0].description,
					retry: highlightCommandArgs.add[0].retry,
					optional: !highlightCommandArgs.add[0].required,
					only: 'text',
					slashType: false
				}
				// {
				// 	id: 'regex',
				// 	description: highlightCommandArgs.add[1].description,
				// 	match: 'flag',
				// 	flag: '--regex',
				// 	prompt: highlightCommandArgs.add[1].description,
				// 	only: 'text',
				// 	slashType: false
				// }
			],
			usage: [],
			examples: [],
			clientPermissions: [],
			userPermissions: []
		});
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { word: ArgType<'string'>; regex: ArgType<'flag'> }) {
		assert(message.inGuild());

		args.regex = false;

		if (!args.regex) {
			if (args.word.length < 2)
				return message.util.send(`${util.emojis.error} You can only highlight words that are longer than 2 characters.`);
			if (args.word.length > 50)
				return await message.util.reply(`${util.emojis.error} You can only highlight words that are shorter than 50 characters.`);
		} else {
			try {
				new RegExp(args.word);
			} catch (e) {
				assert(e instanceof SyntaxError);
				return message.util.send({
					content: `${util.emojis.error} Invalid regex ${util.format.inlineCode(e.message)}.`,
					allowedMentions: AllowedMentions.none()
				});
			}
		}

		const res = await client.highlightManager.addHighlight(message.guild.id, message.author.id, {
			word: args.word,
			regex: args.regex
		});

		if (typeof res === 'string')
			return await message.util.reply({ content: `${util.emojis.error} ${res}`, allowedMentions: AllowedMentions.none() });
		else if (!res)
			return await message.util.reply({
				content: `${util.emojis.error} There was an error highlighting "${args.word}".`,
				allowedMentions: AllowedMentions.none()
			});

		return await message.util.reply({
			content: `${util.emojis.success} Successfully added "${args.word}" to your highlight list.`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
