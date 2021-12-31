// import { BushCommand, type BushMessage, type BushSlashMessage } from '#lib';

// export default class LevelRolesCommand extends BushCommand {
// 	public constructor() {
// 		super('levelRole', {
// 			aliases: ['level-role', 'level-roles', 'lr'],
// 			category: 'config',
// 			description: 'Configure roles to be assigned to users upon reaching certain levels.',
// 			usage: ['level-role add <level> <role>', 'level-role remove <level>'],
// 			examples: ['level-role 1 2'],
// 			args: [
// 				{
// 					id: 'required_argument',
// 					type: 'string',
// 					description: 'This is the first argument.',
// 					prompt: 'What would you like to set your first argument to be?',
// 					retry: '{error} Pick a valid argument.',
// 					slashType: 'STRING'
// 				},
// 				{
// 					id: 'optional_argument',
// 					type: 'string',
// 					description: 'This is the second argument.',
// 					prompt: 'What would you like to set your second argument to be?',
// 					retry: '{error} Pick a valid argument.',
// 					optional: true,
// 					slashType: 'STRING'
// 				}
// 			],
// 			slash: true,
// 			channel: 'guild',
// 			clientPermissions: (m) => util.clientSendAndPermCheck(m),
// 			userPermissions: ['MANAGE_GUILD', 'MANAGE_ROLES']
// 		});
// 	}

// 	public override async exec(
// 		message: BushMessage | BushSlashMessage,
// 		args: { required_argument: string; optional_argument: string }
// 	) {}
// }
