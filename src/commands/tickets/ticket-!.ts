import { BushCommand, clientSendAndPermCheck, deepWriteable, type SlashMessage } from '#lib';
import { Flag, type ArgumentGeneratorReturn, type SlashOption } from 'discord-akairo';
import { ApplicationCommandOptionType } from 'discord.js';

export const ticketSubcommands = deepWriteable({
	create: {
		description: 'Create a ticket.',
		type: ApplicationCommandOptionType.Subcommand,
		options: [
			{
				name: 'word',
				description: 'What word do you want to highlight?',
				retry: '{error} Enter a valid word.',
				type: ApplicationCommandOptionType.String,
				required: true
			}
		]
	}
} as const);

export default class TicketCommand extends BushCommand {
	public constructor() {
		super('ticket', {
			aliases: ['ticket'],
			category: 'ticket',
			description: 'Manage tickets.',
			usage: ['ticket create <reason>'],
			examples: ['ticket creates very cool ticket'],
			slashOptions: Object.entries(ticketSubcommands).map(
				([subcommand, options]) => ({ name: subcommand, ...options } as SlashOption)
			),
			slash: true,
			channel: 'guild',
			clientPermissions: (m) => clientSendAndPermCheck(m),
			userPermissions: []
		});
	}

	public override *args(): ArgumentGeneratorReturn {
		const subcommand: keyof typeof ticketSubcommands = yield {
			id: 'subcommand',
			type: Object.keys(ticketSubcommands),
			prompt: {
				start: 'What sub command would you like to use?',
				retry: `{error} Valid subcommands are: ${Object.keys(ticketSubcommands)
					.map((s) => `\`${s}\``)
					.join()}.`
			}
		};

		return Flag.continue(`ticket-${subcommand}`);
	}

	public override async exec() {
		throw new Error('This command is not meant to be executed directly.');
	}

	public override async execSlash(message: SlashMessage, args: { subcommand: string; subcommandGroup?: string }) {
		// manual `Flag.continue`
		const subcommand = this.handler.modules.get(`ticket-${args.subcommandGroup ?? args.subcommand}`)!;
		return subcommand.exec(message, args);
	}
}
