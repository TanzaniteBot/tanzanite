import { BushCommand, Highlight, HighlightWord, type BushSlashMessage } from '#lib';
import { Flag, type ArgumentGeneratorReturn, type SlashOption } from 'discord-akairo';
import { ApplicationCommandOptionType } from 'discord-api-types/v9';
import { ApplicationCommandSubCommandData, AutocompleteInteraction, CacheType } from 'discord.js';

type Unpacked<T> = T extends (infer U)[] ? U : T;

export const highlightCommandArgs: {
	[Command in keyof typeof highlightSubcommands]: (Unpacked<Required<ApplicationCommandSubCommandData['options']>> & {
		retry?: string;
	})[];
} = {
	add: [
		{
			name: 'word',
			description: 'What word do you want to highlight?',
			retry: '{error} Enter a valid word.',
			type: ApplicationCommandOptionType.String,
			required: true
		}
		// {
		// 	name: 'regex',
		// 	description: 'Should the word be matched using regular expression?',
		// 	type: ApplicationCommandOptionType.Boolean,
		// 	required: false
		// }
	],
	remove: [
		{
			name: 'word',
			description: 'Which word do you want to stop highlighting?',
			retry: '{error} Enter a valid word.',
			type: ApplicationCommandOptionType.String,
			required: true,
			autocomplete: true
		}
	],
	block: [
		{
			name: 'target',
			description: 'What user/channel would you like to prevent from triggering your highlights?',
			retry: '{error} Enter a valid user or channel.',
			type: ApplicationCommandOptionType.String,
			required: true
		}
	],
	unblock: [
		{
			name: 'target',
			description: 'What user/channel would you like to allow triggering your highlights again?',
			retry: '{error} Enter a valid user or channel.',
			type: ApplicationCommandOptionType.String,
			required: true
		}
	],
	show: [],
	clear: [],
	matches: [
		{
			name: 'phrase',
			description: 'What phrase would you like to test your highlighted words against?',
			retry: '{error} Enter a valid phrase to test.',
			type: ApplicationCommandOptionType.String,
			required: true
		}
	]
};

export const highlightSubcommands = {
	add: 'Add a word to highlight.',
	remove: 'Stop highting a word.',
	block: 'Block a user or channel from triggering your highlights.',
	unblock: 'Re-allow a user or channel to triggering your highlights.',
	show: 'List all your current highlighted words.',
	clear: 'Remove all of your highlighted words.',
	matches: 'Test a phrase to see if it matches your current highlighted words.'
} as const;

export default class HighlightCommand extends BushCommand {
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
			slashOptions: Object.entries(highlightSubcommands).map((args) => {
				// typescript being annoying
				const [subcommand, description] = args as [keyof typeof highlightSubcommands, typeof args[1]];

				return {
					name: subcommand,
					description,
					type: ApplicationCommandOptionType.Subcommand,
					options: highlightCommandArgs[subcommand].map((arg) => ({
						name: arg.name,
						description: arg.description,
						type: arg.type,
						required: arg.required,
						autocomplete: arg.autocomplete
					}))
				} as SlashOption;
			}),
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m),
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

	public override async execSlash(message: BushSlashMessage, args: { subcommand: keyof typeof highlightSubcommands }) {
		// manual `Flag.continue`
		const subcommand = this.handler.modules.get(`highlight-${args.subcommand}`)!;
		return subcommand.exec(message, args);
	}

	public override async autocomplete(interaction: AutocompleteInteraction<CacheType>) {
		if (!interaction.inCachedGuild())
			return interaction.respond([{ name: 'You must be in a server to use this command.', value: 'error' }]);

		switch (interaction.options.getSubcommand(true)) {
			case 'word': {
				const { words } = (await Highlight.findOne({
					where: {
						guild: interaction.guild.id,
						user: interaction.user.id
					}
				})) ?? { words: [] as HighlightWord[] };
				if (!words.length) return interaction.respond([]);
				return interaction.respond(words.map((w) => ({ name: w.word, value: w.word })));
			}
		}
	}
}
