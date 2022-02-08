import { AllowedMentions, BushCommand, Highlight, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import { ArgumentGeneratorReturn } from 'discord-akairo';
import { highlightCommandArgs, highlightSubcommands } from './highlight-!';

export default class HighlightRemoveCommand extends BushCommand {
	public constructor() {
		super('highlight-remove', {
			aliases: [],
			category: 'utilities',
			description: highlightSubcommands.remove,
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
				start: highlightCommandArgs.remove[0].description,
				retry: highlightCommandArgs.remove[0].retry,
				optional: !highlightCommandArgs.remove[0].required
			}
		};

		return { word };
	}

	public override async exec(message: BushMessage | BushSlashMessage, args: { word: ArgType<'string'> }) {
		assert(message.inGuild());

		const [highlight] = await Highlight.findOrCreate({
			where: {
				guild: message.guild.id,
				user: message.author.id
			}
		});

		if (!highlight.words.some((w) => w.word === args.word))
			return await message.util.reply({
				content: `${util.emojis.error} You have not highlighted "${args.word}".`,
				allowedMentions: AllowedMentions.none()
			});

		highlight.words = util.removeFromArray(highlight.words, highlight.words.find((w) => w.word === args.word)!);
		await highlight.save();

		return await message.util.reply({
			content: `${util.emojis.success} Successfully removed "${args.word}" from your highlight list.`,
			allowedMentions: AllowedMentions.none()
		});
	}
}
