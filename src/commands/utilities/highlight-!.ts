import { BotCommand, deepWriteable, Highlight, type HighlightWord, type SlashMessage } from '#lib';
import { Flag, type ArgumentGeneratorReturn, type SlashOption } from '@tanzanite/discord-akairo';
import { ApplicationCommandOptionType, Constants, type AutocompleteInteraction, type CacheType } from 'discord.js';

export const highlightSubcommands = deepWriteable({
	add: {
		description: 'Add a word to highlight.',
		type: ApplicationCommandOptionType.Subcommand,
		options: [
			{
				name: 'word',
				description: 'What word do you want to highlight?',
				retry: '{error} Enter a valid word.',
				type: ApplicationCommandOptionType.String,
				required: true
			}
			/* {
				name: 'regex',
				description: 'Should the word be matched using regular expression?',
				type: ApplicationCommandOptionType.Boolean,
				required: false
			} */
		]
	},
	remove: {
		description: 'Stop highting a word.',
		type: ApplicationCommandOptionType.Subcommand,
		options: [
			{
				name: 'word',
				description: 'Which word do you want to stop highlighting?',
				retry: '{error} Enter a valid word.',
				type: ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true
			}
		]
	},
	block: {
		description: 'Block a user or channel from triggering your highlights.',
		type: ApplicationCommandOptionType.SubcommandGroup,
		options: [
			{
				name: 'user',
				description: 'Block a user from triggering your highlights.',
				start: 'What user/channel would you like to prevent from triggering your highlights?',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'target',
						description: 'What user would you like to prevent from triggering your highlights?',
						retry: '{error} Enter a valid user or channel.',
						type: ApplicationCommandOptionType.User,
						resolve: 'Member',
						required: true
					}
				]
			},
			{
				name: 'channel',
				description: 'Block a channel from triggering your highlights.',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'target',
						description: 'What channel would you like to prevent from triggering your highlights?',
						type: ApplicationCommandOptionType.Channel,
						channelTypes: Constants.TextBasedChannelTypes,
						required: true
					}
				]
			}
		]
	},
	unblock: {
		description: 'Re-allow a user or channel to triggering your highlights.',
		type: ApplicationCommandOptionType.SubcommandGroup,
		options: [
			{
				name: 'user',
				description: 'Re-allow a user to triggering your highlights',
				start: 'What user/channel would you like to allow triggering your highlights again?',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'target',
						description: 'What user would you like to allow triggering your highlights again?',
						retry: '{error} Enter a valid user or channel.',
						type: ApplicationCommandOptionType.User,
						resolve: 'Member',
						required: true
					}
				]
			},
			{
				name: 'channel',
				description: 'Re-allow a channel to triggering your highlights.',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'target',
						description: 'What channel would you like to prevent from triggering your highlights?',
						type: ApplicationCommandOptionType.Channel,
						channelTypes: Constants.TextBasedChannelTypes,
						required: true
					}
				]
			}
		]
	},
	show: {
		description: 'List all your current highlighted words.',
		type: ApplicationCommandOptionType.Subcommand,
		options: []
	},
	clear: {
		description: 'Remove all of your highlighted words.',
		type: ApplicationCommandOptionType.Subcommand,
		options: []
	},
	matches: {
		description: 'Test a phrase to see if it matches your current highlighted words.',
		type: ApplicationCommandOptionType.Subcommand,
		options: [
			{
				name: 'phrase',
				description: 'What phrase would you like to test your highlighted words against?',
				retry: '{error} Enter a valid phrase to test.',
				type: ApplicationCommandOptionType.String,
				required: true
			}
		]
	}
} as const);

export default class HighlightCommand extends BotCommand {
	public constructor() {
		super('highlight', {
			aliases: ['highlight', 'hl'],
			category: 'utilities',
			description: 'Highlight a word or phrase and have Tanzanite dm you when someone mentions it.',
			usage: [
				'highlight add <word>',
				'highlight remove <word>',
				'highlight block <user|channel>',
				'highlight unblock <user|channel>',
				'highlight show',
				'highlight clear',
				'highlight matches <phrase>'
			],
			examples: [
				'highlight add spaghetti',
				'highlight remove meatballs',
				'highlight block @tyman',
				'highlight unblock #bot-commands',
				'highlight show',
				'highlight clear',
				'highlight matches I really like to eat bacon with my spaghetti'
			],
			slashOptions: Object.entries(highlightSubcommands).map(
				([subcommand, options]) => ({ name: subcommand, ...options } as SlashOption)
			),
			slash: true,
			channel: 'guild',
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: []
		});
	}

	public override *args(): ArgumentGeneratorReturn {
		const subcommand: keyof typeof highlightSubcommands = yield {
			id: 'subcommand',
			type: Object.keys(highlightSubcommands),
			prompt: {
				start: 'What sub command would you like to use?',
				retry: `{error} Valid subcommands are: ${Object.keys(highlightSubcommands)
					.map((s) => `\`${s}\``)
					.join()}.`
			}
		};

		return Flag.continue(`highlight-${subcommand}`);
	}

	public override async exec() {
		throw new Error('This command is not meant to be executed directly.');
	}

	public override async execSlash(message: SlashMessage, args: { subcommand: string; subcommandGroup?: string }) {
		// manual `Flag.continue`
		const subcommand = this.handler.modules.get(`highlight-${args.subcommandGroup ?? args.subcommand}`)!;
		return subcommand.exec(message, args);
	}

	public override async autocomplete(interaction: AutocompleteInteraction<CacheType>) {
		if (!interaction.inCachedGuild())
			return interaction.respond([{ name: 'You must be in a server to use this command.', value: 'error' }]);

		switch (interaction.options.getSubcommandGroup(false) ?? interaction.options.getSubcommand(true)) {
			case 'word': {
				const { words } = (await Highlight.findOne({
					where: { guild: interaction.guild.id, user: interaction.user.id }
				})) ?? { words: [] as HighlightWord[] };
				if (!words.length) return interaction.respond([]);
				return interaction.respond(words.map((w) => ({ name: w.word, value: w.word })));
			}
		}
	}
}
