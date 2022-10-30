// import { clientSendAndPermCheck, CustomCommand, type CommandMessage } from '#lib';
// import assert from 'node:assert/strict';
// import crypto from 'node:crypto';
// import { ApplicationCommandOptionType } from 'discord.js';
// import got from 'got';

// assert(crypto);
// assert(got);

// export default class HashCommand extends CustomCommand {
// 	public constructor() {
// 		super('hash', {
// 			aliases: ['hash'],
// 			category: 'utilities',
// 			description: 'Gets the file hash of the given discord link',
// 			usage: ['hash <fileUrl>'],
// 			examples: ['hash https://cdn.discordapp.com/emojis/782630946435366942.png?v=1'], //nice
// 			args: [
// 				{
// 					id: 'url',
// 					description: 'The url of the discord link to find the hash of.',
// 					type: 'url',
// 					prompt: 'What url would you like to find the hash of?',
// 					retry: '{error} Enter a valid url.',
// 					slashType: ApplicationCommandOptionType.String
// 				}
// 			],
// 			clientPermissions: [],
// 			userPermissions: []
// 		});
// 	}

// 	public override async exec(message: CommandMessage, { url }: { url: string }) {
// 		try {
// 			const req = await got.get(url);
// 			const rawHash = crypto.createHash('md5');
// 			rawHash.update(req.rawBody.toString('binary'));
// 			const hash = rawHash.digest('hex');
// 			await message.util.reply(`\`${hash}\``);
// 		} catch {
// 			await message.util.reply('Unable to calculate hash.');
// 		}
// 	}
// }
