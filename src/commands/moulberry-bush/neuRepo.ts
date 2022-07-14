import { BushCommand, clientSendAndPermCheck, type ArgType, type CommandMessage, type SlashMessage } from '#lib';
import { ApplicationCommandOptionType, AutocompleteInteraction, CacheType, PermissionFlagsBits } from 'discord.js';

export default class NeuRepoCommand extends BushCommand {
	public static items: { name: string; id: string }[] = [];

	public constructor() {
		super('neuRepo', {
			aliases: ['neu-repo', 'repo-item', 'neu-item', 'item-repo'],
			category: "Moulberry's Bush",
			description: 'Get information about an item from the NEU item repo.',
			usage: ['neu-repo <item>'],
			examples: ['neu-repo BARRIER'],
			args: [
				{
					id: 'item',
					description: 'The item id that you would like to find neu item information about.',
					type: 'string',
					prompt: 'What SkyBlock item would you like to get information about?',
					retry: '{error} Pick a valid SkyBlock item ID. Try using the slash command for a better experience.',
					slashType: ApplicationCommandOptionType.String,
					autocomplete: true
				}
				/* {
					id: 'dangerous',
					description: 'Whether or not to use the dangerous branch.',
					prompt: 'Would you like to use the dangerous branch instead of the master branch?',
					match: 'flag',
					flag: ['--dangerous', '-d'],
					default: false,
					optional: true,
					slashType: ApplicationCommandOptionType.Boolean
				} */
			],
			slash: true,
			clientPermissions: (m) => clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: []
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		args: { item: ArgType<'string'> /* dangerous: ArgType<'flag'> */ }
	) {}

	public override async autocomplete(interaction: AutocompleteInteraction<CacheType>) {}
}
