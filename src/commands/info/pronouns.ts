import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { Snowflake } from 'discord-api-types';
import { MessageEmbed, User } from 'discord.js';
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
	public constructor() {
		super('pronouns', {
			aliases: ['pronouns', 'pronoun'],
			category: 'info',
			description: {
				usage: 'pronouns <user>',
				examples: ['pronouns IRONM00N'],
				content: 'Finds the pronouns of a user using https://pronoundb.org.'
			},
			args: [
				{
					id: 'user',
					customType: util.arg.union('user', 'snowflake'),
					prompt: {
						start: 'Who would you like to view the pronouns of?',
						retry: '{error} Choose a valid user to view the pronouns of.',
						optional: true
					}
				}
			],
			clientPermissions: ['SEND_MESSAGES'],
			slashOptions: [
				{
					name: 'user',
					description: 'The user to get pronouns for',
					type: 'USER',
					required: false
				}
			],
			slash: true
		});
	}
	override async exec(message: BushMessage | BushSlashMessage, args: { user?: User | Snowflake }): Promise<unknown> {
		const user =
			args?.user === undefined || args?.user === null
				? message.author
				: typeof args.user === 'object'
				? args.user
				: await client.users.fetch(`${args.user}`).catch(() => undefined);

		if (user === undefined) return message.util.reply(`${util.emojis.error} Invalid user.`);

		const author = user.id === message.author.id;
		try {
			const apiRes: { pronouns: pronounsType } = await got
				.get(`https://pronoundb.org/api/v1/lookup?platform=discord&id=${user.id}`)
				.json();
			return await message.util.reply({
				embeds: [
					new MessageEmbed({
						title: `${author ? 'Your' : `${user.tag}'s`} pronouns:`,
						description: pronounMapping[apiRes.pronouns],
						footer: {
							text: 'Data provided by https://pronoundb.org/'
						}
					})
				]
			});
		} catch (e) {
			if (e instanceof HTTPError && e.response.statusCode === 404) {
				if (author) {
					return await message.util.reply(
						'You do not appear to have any pronouns set. Please go to https://pronoundb.org/ and set your pronouns.'
					);
				} else {
					return await message.util.reply(
						`${user.tag} does not appear to have any pronouns set. Please tell them to go to https://pronoundb.org/ and set their pronouns.`
					);
				}
			} else throw e;
		}
	}
}
