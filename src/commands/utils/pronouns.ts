import { BushCommand } from '../../lib/extensions/BushCommand';
import { User, Message, MessageEmbed } from 'discord.js';
import got, { HTTPError } from 'got';

export const pronounMapping = {
	unspecified: 'Unspecified',
	hh: 'He/Him',
	hi: 'He/It',
	hs: 'He/She',
	ht: 'He/They',
	ih: 'It/Him',
	ii: 'It/Its',
	is: 'It/She',
	it: 'It/They',
	shh: 'She/He',
	sh: 'She/Her',
	si: 'She/It',
	st: 'She/They',
	th: 'They/He',
	ti: 'They/It',
	ts: 'They/She',
	tt: 'They/Them',
	any: 'Any pronouns',
	other: 'Other pronouns',
	ask: 'Ask me my pronouns',
	avoid: 'Avoid pronouns, use my name'
};

export type pronounsType = keyof typeof pronounMapping;
export default class PronounsCommand extends BushCommand {
	constructor() {
		super('pronouns', {
			aliases: ['pronouns', 'pronoun'],
			category: 'utils',
			description: {
				usage: 'pronouns <user>',
				examples: ['pronouns IRONM00N'],
				content: 'Finds the pronouns of a user using https://pronoundb.org.'
			},
			args: [
				{
					id: 'user',
					type: 'user',
					default: null
				}
			],
			clientPermissions: ['SEND_MESSAGES']
		});
	}
	async exec(message: Message, { user }: { user: User | null }): Promise<void> {
		if (user === null) user = message.author;
		try {
			const apiRes: { pronouns: pronounsType } = await got.get(`https://pronoundb.org/api/v1/lookup?platform=discord&id=${user?.id}`).json();
			await message.util.reply(
				new MessageEmbed({
					title: `${user?.tag}'s pronouns:`,
					description: pronounMapping[apiRes.pronouns],
					footer: {
						text: 'Data provided by https://pronoundb.org/'
					}
				})
			);
		} catch (e) {
			if (e instanceof HTTPError && e.response.statusCode === 404) {
				await message.util.reply(`${user?.tag} does not appear to have any pronouns set. Please tell them to go to https://pronoundb.org/ and set their pronouns.`);
			} else throw e;
		}
	}
}
