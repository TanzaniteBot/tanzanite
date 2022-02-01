import { BushCommand, type ArgType, type BushMessage, type BushSlashMessage } from '#lib';
import { ApplicationCommandOptionType, Embed, PermissionFlagsBits } from 'discord.js';

export default class PronounsCommand extends BushCommand {
	public constructor() {
		super('pronouns', {
			aliases: ['pronouns', 'pronoun'],
			category: 'info',
			description: 'Finds the pronouns of a user using https://pronoundb.org.',
			usage: ['pronouns <user>'],
			examples: ['pronouns IRONM00N'],
			args: [
				{
					id: 'user',
					description: 'The user to get pronouns for.',
					type: 'globalUser',
					prompt: 'Who would you like to view the pronouns of?',
					retry: '{error} Choose a valid user to view the pronouns of.',
					optional: true,
					slashType: ApplicationCommandOptionType.User
				}
			],
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: [],
			slash: true
		});
	}

	override async exec(message: BushMessage | BushSlashMessage, args: { user?: ArgType<'globalUser'> }) {
		const user = args.user ?? message.author;
		const author = user.id === message.author.id;

		if (message.util.isSlashMessage(message)) await message.interaction.deferReply();

		const pronouns = await util.getPronounsOf(user);
		if (!pronouns) {
			return await message.util.reply(
				`${author ? 'You do' : `${util.discord.escapeMarkdown(user.tag)} does`} not appear to have any pronouns set. Please${
					author ? '' : ' tell them to'
				} go to https://pronoundb.org/ and set ${author ? 'your' : 'their'} pronouns.`
			);
		} else {
			return await message.util.reply({
				embeds: [
					new Embed({
						title: `${author ? 'Your' : `${util.discord.escapeMarkdown(user.tag)}'s`} pronouns:`,
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
