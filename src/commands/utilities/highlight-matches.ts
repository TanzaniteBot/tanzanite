import { BotCommand, ButtonPaginator, chunk, colors, emojis, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import assert from 'assert/strict';
import { type ArgumentGeneratorReturn } from 'discord-akairo';
import { type APIEmbed } from 'discord.js';
import { highlightSubcommands } from './highlight-!.js';

export default class HighlightMatchesCommand extends BotCommand {
	public constructor() {
		super('highlight-matches', {
			aliases: [],
			category: 'utilities',
			description: highlightSubcommands.matches.description,
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
				start: highlightSubcommands.matches.options[0].description,
				retry: highlightSubcommands.matches.options[0].retry,
				optional: !highlightSubcommands.matches.options[0].required
			}
		};

		return { phrase };
	}

	public override async exec(message: CommandMessage | SlashMessage, args: { phrase: ArgType<'string'> }) {
		assert(message.inGuild());

		const res = await this.client.highlightManager.checkPhrase(message.guild.id, message.author.id, args.phrase);

		if (!res.size) return await message.util.reply(`${emojis.error} You are not highlighting any words`);

		const lines = res.map((passed, hl) => `${passed ? emojis.check : emojis.cross} ${hl.regex ? `/${hl.word}/gi` : hl.word}`);
		const chunked = chunk(lines, 10);

		const pages = chunked.map(
			(chunk): APIEmbed => ({
				title: `Matches`,
				description: chunk.join('\n'),
				color: colors.default
			})
		);

		return pages.length > 1 ? await ButtonPaginator.send(message, pages) : message.util.send({ embeds: pages });
	}
}
