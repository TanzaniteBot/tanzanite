// import { BushCommand, clientSendAndPermCheck, type ArgType, type CommandMessage, type OptArgType, type SlashMessage } from '#lib';
// import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';

// export default class CustomAutomodPhrasesCommand extends BushCommand {
// 	public constructor() {
// 		super('customAutomodPhrases', {
// 			aliases: ['custom-automod-phrases'],
// 			category: 'config',
// 			description: 'Configure additional phrases to be used for automod.',
// 			usage: ['custom-automod-phrases <requiredArg> [optionalArg]'],
// 			examples: ['custom-automod-phrases 1 2'],
// 			args: [
// 				{
// 					id: 'required_argument',
// 					type: 'string',
// 					description: 'This is the first argument.',
// 					prompt: 'What would you like to set your first argument to be?',
// 					retry: '{error} Pick a valid argument.',
// 					slashType: ApplicationCommandOptionType.String
// 				},
// 				{
// 					id: 'optional_argument',
// 					type: 'string',
// 					description: 'This is the second argument.',
// 					prompt: 'What would you like to set your second argument to be?',
// 					retry: '{error} Pick a valid argument.',
// 					optional: true,
// 					slashType: ApplicationCommandOptionType.String
// 				}
// 			],
// 			slash: true,
// 			channel: 'guild',
// 			clientPermissions: [],
// 			userPermissions: ['ManageGuild']
// 		});
// 	}

// 	public override async exec(
// 		message: CommandMessage | SlashMessage,
// 		args: { required_argument: ArgType<'string'>; optional_argument: OptArgType<'string'> }
// 	) {}
// }
