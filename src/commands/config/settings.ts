// import { BushCommand, BushMessage, BushSlashMessage, guildSettings } from '@lib';

// export default class SettingsCommand extends BushCommand {
// 	public constructor() {
// 		super('settings', {
// 			aliases: ['settings', 'settings', 'configure', 'config'],
// 			category: 'config',
// 			description: {
// 				content: 'Configure server options. Hint this is easier to use with the slash command.',
// 				usage: 'config <\'add\'|\'remove\'|\'toggle\'> <setting>',
// 				examples: ['template 1 2']
// 			},
// 			args: [
// 				{
// 					id: 'action',
// 					customType: ['add', 'remove', 'toggle'],
// 					prompt: {
// 						start: 'What action would you like to perform, it can be `add`, `remove`, or `toggle`.',
// 						retry: '{error} Choose a either `add`, `remove`, or `toggle`.',
// 						optional: false
// 					}
// 				},
// 				{
// 					id: 'setting',
// 					customType: Object.keys(guildSettings),
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
// 			clientPermissions: ['SEND_MESSAGES'],
// 			userPermissions: ['SEND_MESSAGES']
// 		});
// 	}
// 	public override async exec(message: BushMessage | BushSlashMessage): Promise<unknown> {
// 		return await message.util.reply(`${util.emojis.error} Do not use the template command.`);
// 	}
// }
