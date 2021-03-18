// import { BushCommand } from '../../lib/extensions/BushCommand';
// import { Message } from 'discord.js';

// export default class Test2Command extends BushCommand {
// 	public constructor() {
// 		super('update', {
// 			aliases: ['update'],
// 			category: 'dev',
// 			description: {
// 				content: 'git pulls from the repo then recompiles the bot',
// 				usage: 'update',
// 				examples: ['update'],
// 			},
// 			ownerOnly: true,
// 			clientPermissions: ['SEND_MESSAGES']
// 		});
// 	}
// 	public async exec(message: Message): Promise<void> {
// 		await message.channel.send('Not done because TrashCan can\'t code.');
// 	}
// }
