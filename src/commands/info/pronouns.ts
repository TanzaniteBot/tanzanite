import { User, Message, MessageEmbed } from 'discord.js';
import { BotCommand } from '../../extensions/BotCommand';
import got, { HTTPError } from 'got';

export type pronounsType =
	| 'unspecified'
	| 'hh'
	| 'hi'
	| 'hs'
	| 'ht'
	| 'ih'
	| 'ii'
	| 'is'
	| 'it'
	| 'shh'
	| 'sh'
	| 'si'
	| 'st'
	| 'th'
	| 'ti'
	| 'ts'
	| 'tt'
	| 'any'
	| 'other'
	| 'ask'
	| 'avoid';

export default class PronounsCommand extends BotCommand {
	constructor() {
		super('pronouns', {
			aliases: ['pronouns', 'pronoun'],
			args: [
				{
					id: 'user',
					type: 'user',
					default: null,
				},
			],
		});
	}
	async exec(message: Message, { user }: { user: User | null }): Promise<void> {
		if (user === null) user = message.author;
		try {
			const pronouns: { pronouns: pronounsType } = await got.get(`https://pronoundb.org/api/v1/lookup?platform=discord&id=${user.id}`).json();
			await message.util.reply(
				new MessageEmbed({
					title: `${user.tag}'s pronouns:`,
				})
			);
		} catch (e) {
			if (e instanceof HTTPError && e.response.statusCode === 404) {
				await message.util.reply(`${user.tag} does not appear to have any pronouns set.`);
			}
			throw e;
		}
	}
}
