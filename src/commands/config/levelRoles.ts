// import { BushCommand, BushMessage, BushSlashMessage } from '@lib';

// export default class LevelRolesCommand extends BushCommand {
// 	public constructor() {
// 		super('levelRole', {
// 			aliases: ['level-role', 'level-roles', 'lr'],
// 			category: 'config',
// 			description: {
// 				content: 'Configure roles to be assigned to users upon reaching certain levels.',
// 				usage: ['level-role add <level> <role>', 'level-role remove <level>'],
// 				examples: ['level-role 1 2']
// 			},
// 			args: [
// 				{
// 					id: 'action',
// 					customType: ['add', 'remove']
// 				},
// 				{
// 					id: 'role',
// 					type: 'role',
// 					prompt: {
// 						start: 'What would you like to set your first argument to be?',
// 						retry: '{error} Pick a valid argument.',
// 						optional: false
// 					}
// 				},
// 				{
// 					id: 'level',
// 					type: 'integer',
// 					prompt: {
// 						start: 'What would you like to set your second argument to be?',
// 						retry: '{error} Pick a valid argument.',
// 						optional: false
// 					}
// 				}
// 			],
// 			slash: true,
// 			slashOptions: [
// 				{
// 					name: 'role',
// 					description: 'What would you like to set your first argument to be?',
// 					type: 'STRING',
// 					required: true
// 				},
// 				{
// 					name: 'level',
// 					description: 'What would you like to set your second argument to be?',
// 					type: 'STRING',
// 					required: true
// 				}
// 			],
// 			channel: 'guild',
// 			clientPermissions: (m) => util.clientSendAndPermCheck(m),
// 			userPermissions: ['MANAGE_GUILD', 'MANAGE_ROLES']
// 		});
// 	}

// 	public override async exec(
// 		message: BushMessage | BushSlashMessage,
// 		args: { required_argument: string; optional_argument: string }
// 	): Promise<unknown> {
// 		return await message.util.reply(`${util.emojis.error} Do not use the template command.`);
// 		args;
// 	}
// }
