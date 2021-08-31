import { BushCommand, BushMessage, BushSlashMessage } from '@lib';
import { Snowflake } from 'discord-api-types';
import { MessageEmbed, User } from 'discord.js';

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
		const user = (await util.resolveNonCachedUser(args.user)) ?? message.author;

		if (!user) return message.util.reply(`${util.emojis.error} Invalid user.`);

		const author = user.id === message.author.id;

		const pronouns = await util.getPronounsOf(user);
		if (!pronouns) {
			return await message.util.reply(
				`${author ? 'You do' : `${user.tag} does`} not appear to have any pronouns set. Please ${
					author ? '' : 'tell them to'
				} go to https://pronoundb.org/ and set ${author ? 'your' : 'their'} pronouns.`
			);
		} else {
			return await message.util.reply({
				embeds: [
					new MessageEmbed({
						title: `${author ? 'Your' : `${user.tag}'s`} pronouns:`,
						description: pronouns,
						footer: {
							text: 'Data provided by https://pronoundb.org/'
						}
					})
				]
			});
		}
	}
}
