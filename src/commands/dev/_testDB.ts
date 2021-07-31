// import { BushCommand, BushSlashMessage, Global } from '@lib';
// import { Message } from 'discord.js';
// import { inspect } from 'util';

// export default class TestDurationCommand extends BushCommand {
// 	public constructor() {
// 		super('db', {
// 			aliases: ['db'],
// 			category: 'dev',
// 			description: {
// 				content: '',
// 				usage: '',
// 				examples: ['']
// 			},
// 			slash: false,
// 			hidden: true,
// 			ownerOnly: true,
// 			completelyHide: true
// 		});
// 	}

// 	override async exec(message: Message | BushSlashMessage): Promise<unknown> {
// 		return await message.util.reply(await util.codeblock(inspect((await Global.findOne()).environment), 2000, 'js'));
// 	}
// }
