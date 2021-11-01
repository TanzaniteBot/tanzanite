import { BushCommand, type BushMessage, type BushSlashMessage } from '@lib';
import { MessageEmbed, type User } from 'discord.js';

export default class PronounsCommand extends BushCommand {
	public constructor() {
		super('pronouns', {
			aliases: ['pronouns', 'pronoun'],
			category: 'info',
			description: {
				content: 'Finds the pronouns of a user using https://pronoundb.org.',
				usage: ['pronouns <user>'],
				examples: ['pronouns IRONM00N']
			},
			args: [
				{
					id: 'user',
					type: 'globalUser',
					prompt: {
						start: 'Who would you like to view the pronouns of?',
						retry: '{error} Choose a valid user to view the pronouns of.',
						optional: true
					}
				}
			],
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['EMBED_LINKS'], true),
			userPermissions: [],
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
	override async exec(message: BushMessage | BushSlashMessage, args: { user?: User }) {
		const user = args.user ?? message.author;
		const author = user.id === message.author.id;

		const pronouns = await util.getPronounsOf(user);
		if (!pronouns) {
			return await message.util.reply(
				`${author ? 'You do' : `${user.tag} does`} not appear to have any pronouns set. Please${
					author ? '' : ' tell them to'
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
