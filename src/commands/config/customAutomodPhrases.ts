// import { BushCommand, type BushMessage, type BushSlashMessage } from '@lib';

// export default class CustomAutomodPhrasesCommand extends BushCommand {
// 	public constructor() {
// 		super('customAutomodPhrases', {
// 			aliases: ['custom-automod-phrases'],
// 			category: 'config',
// 			description: {
// 				content: 'Configure additional phrases to be used for automod.',
// 				usage: ['custom-automod-phrases <requiredArg> [optionalArg]'],
// 				examples: ['custom-automod-phrases 1 2']
// 			},
// 			args: [
// 				{
// 					id: 'required_argument',
// 					type: 'string',
// 					prompt: {
// 						start: 'What would you like to set your first argument to be?',
// 						retry: '{error} Pick a valid argument.',
// 						optional: false
// 					}
// 				},
// 				{
// 					id: 'optional_argument',
// 					type: 'string',
// 					prompt: {
// 						start: 'What would you like to set your second argument to be?',
// 						retry: '{error} Pick a valid argument.',
// 						optional: true
// 					}
// 				}
// 			],
// 			slash: true,
// 			slashOptions: [
// 				{
// 					name: 'required_argument',
// 					description: 'What would you like to set your first argument to be?',
// 					type: 'STRING',
// 					required: true
// 				},
// 				{
// 					name: 'optional_argument',
// 					description: 'What would you like to set your second argument to be?',
// 					type: 'STRING',
// 					required: false
// 				}
// 			],
// 			channel: 'guild',
// 			clientPermissions: (m) => util.clientSendAndPermCheck(m),
// 			userPermissions: ['MANAGE_GUILD']
// 		});
// 	}

// 	public override async exec(
// 		message: BushMessage | BushSlashMessage,
// 		args: { required_argument: string; optional_argument: string }
// 	) {
// 		return await message.util.reply(`${util.emojis.error} Do not use the template command.`);
// 		args;
// 	}
// }
