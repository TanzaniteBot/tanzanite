import { AllowedMentions, BushCommand, Highlight, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import { ArgumentGeneratorReturn } from 'discord-akairo';
import { highlightCommandArgs, highlightSubcommands } from './highlight-!';

export default class HighlightAddCommand extends BushCommand {
	public constructor() {
		super('highlight-add', {
			aliases: [],
			category: 'utilities',
			description: highlightSubcommands.add,
			usage: [],
			examples: [],
			clientPermissions: [],
			userPermissions: []
		});
	}

	public override *args(): ArgumentGeneratorReturn {
		const word: ArgType<'string'> = yield {
			type: 'string',
			match: 'rest',
			prompt: {
				start: highlightCommandArgs.add[0].description,
				retry: highlightCommandArgs.add[0].retry,
				optional: !highlightCommandArgs.add[0].required
			}
		};

		const regex: boolean = yield {
			match: 'flag',
			flag: 'regex'
		};

		return { word, regex };
	}

	public override async exec(
		message: BushMessage | BushSlashMessage,
		args: { word: ArgType<'string'>; regex: ArgType<'boolean'> }
	) {
		assert(message.inGuild());

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

		const [highlight] = await Highlight.findOrCreate({
			where: {
				guild: message.guild.id,
				user: message.author.id
			}
		});

		if (highlight.words.some((w) => w.word === args.word))
			return await message.util.reply({
				content: `${util.emojis.error} You have already highlighted "${args.word}".`,
				allowedMentions: AllowedMentions.none()
			});

		highlight.words = util.addToArray(highlight.words, { word: args.word, regex: args.regex });
		await highlight.save();

		return await message.util.reply({
			content: `${util.emojis.success} Successfully added "${args.word}" to your highlight list.`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
