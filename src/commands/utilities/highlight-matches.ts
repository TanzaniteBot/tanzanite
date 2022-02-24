import { BushCommand, ButtonPaginator, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
import assert from 'assert';
import { ArgumentGeneratorReturn } from 'discord-akairo';
import { APIEmbed } from 'discord-api-types/v9';
import { highlightCommandArgs, highlightSubcommands } from './highlight-!.js';

export default class HighlightMatchesCommand extends BushCommand {
	public constructor() {
		super('highlight-matches', {
			aliases: [],
			category: 'utilities',
			description: highlightSubcommands.matches,
			usage: [],
			examples: [],
			clientPermissions: [],
			userPermissions: []
		});
	}

	public override *args(): ArgumentGeneratorReturn {
		const phrase: ArgType<'string'> = yield {
			type: 'string',
			match: 'rest',
			prompt: {
				start: highlightCommandArgs.matches[0].description,
				retry: highlightCommandArgs.matches[0].retry,
				optional: !highlightCommandArgs.matches[0].required
			}
		};

		return { phrase };
	}

	public override async exec(message: BushMessage | BushSlashMessage, args: { phrase: ArgType<'string'> }) {
		assert(message.inGuild());

		const res = await client.highlightManager.checkPhrase(message.guild.id, message.author.id, args.phrase);

		if (!res.size) return await message.util.reply(`${util.emojis.error} You are not highlighting any words`);

		const lines = res.map(
			(passed, hl) => `${passed ? util.emojis.check : util.emojis.cross} ${hl.regex ? `/${hl.word}/gi` : hl.word}`
		);
		const chunked = util.chunk(lines, 10);

		const pages = chunked.map(
			(chunk): APIEmbed => ({
				title: `Matches`,
				description: chunk.join('\n'),
				color: util.colors.default
			})
		);

		return pages.length > 1 ? await ButtonPaginator.send(message, pages) : message.util.send({ embeds: pages });
	}
}
