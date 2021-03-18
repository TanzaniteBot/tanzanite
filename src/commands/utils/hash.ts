import { Message } from 'discord.js';
import { BotCommand } from '../../lib/extensions/BotCommand';
import got from 'got';
import crypto from 'crypto';

export default class HashCommand extends BotCommand {
	constructor() {
		super('hash', {
			aliases: ['hash'],
			category: 'utils',
			description: {
				content: 'Gets the file hash of the given discord link',
				usage: 'hash <file url>',
				examples: ['hash https://cdn.discordapp.com/emojis/782630946435366942.png?v=1'] //nice
			},
			args: [
				{
					id: 'url',
					type: 'url',
					match: 'content',
					prompt: {
						start: 'What url would you like to find the hash of?',
						retry: '<:no:787549684196704257> Enter a valid url.'
					}
				}
			],
			clientPermissions: ['SEND_MESSAGES']
		});
	}
	public async exec(message: Message, { url }: { url: string }): Promise<void> {
		try {
			const req = await got.get(url);
			const rawHash = crypto.createHash('md5');
			rawHash.update(req.rawBody.toString('binary'));
			const hash = rawHash.digest('hex');
			await message.util.reply(`\`${hash}\``);
		} catch {
			await message.util.reply('Unable to calculate hash.');
		}
	}
}
