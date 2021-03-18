// import { Message, User, MessageEmbed } from 'discord.js';
// import { BushCommand } from '../../lib/extensions/BushCommand';

// export default class MuteCommand extends BushCommand {
// 	public constructor() {
// 		super('mute', {
// 			aliases: ['mute'],
// 			category: 'moderation',
// 			description: {
// 				content: "A command to mute someone.",
// 				usage: 'mute <user> [time] [reason]',
// 				examples: ['mute IRONM00N 1d bad boi']
// 			},
// 			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS', 'SEND_MESSAGES'],
// 			userPermissions: ['MANAGE_ROLES'],
// 			args: [
// 				{
// 					id: 'user',
// 					type: 'user',
// 					prompt: {
// 						start: 'What user would you like to mute?',
// 						retry: '<:no:787549684196704257> Choose a valid user to mute.'
// 					}
// 				},
// 				{
// 					id: 'time',
// 					type: 'string',
// 					prompt: {
// 						start: 'How long should the user be muted for?',
// 						retry: '<:no:787549684196704257> Pick a valid new nickname.',
// 						optional: true
// 					},
// 				},
// 				{
// 					id: 'reason',
// 					type: 'string',

// 				}
// 			],
// 			channel: 'guild'
// 		});
// 	}
// 	public async exec(message: Message, { user, time, reason }: { user: User; time: string, reason: string }): Promise<void> {
// 		//
// 	}
// }
