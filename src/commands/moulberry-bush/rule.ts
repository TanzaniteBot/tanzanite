import { Argument } from 'discord-akairo';
import { Message, MessageEmbed, User } from 'discord.js';
import AllowedMentions from '../../lib/utils/AllowedMentions';
import { BotCommand } from '../../lib/extensions/BotCommand';

export default class RuleCommand extends BotCommand {
	private rules = [
		{
			title: "Follow Discord's TOS",
			description:
				"Be sure to follow discord's TOS found at <https://discordapp.com/tos>, you must be 13 to use discord so if you admit to being under 13 you will be banned from the server."
		},
		{
			title: 'Be Respectful',
			description:
				'Racist, sexist, homophobic, xenophobic, transphobic, ableist, hate speech, slurs, or any other derogatory, toxic, or discriminatory behavior will not be tolerated.'
		},
		{
			title: 'No Spamming',
			description:
				'Including but not limited to: any messages that do not contribute to the conversation, repeated messages, randomly tagging users, and chat flood.'
		},
		{
			title: 'English',
			description:
				'The primary language of the server is English, please keep all discussions in English.'
		},
		{
			title: 'Safe for Work',
			description:
				'Please keep NSFW and NSFL content out of this server, avoid borderline images as well as keeping your status and profile picture SFW.'
		},
		{
			title: 'No Advertising',
			description:
				'Do not promote anything without prior approval from a staff member, this includes DM advertising.'
		},
		{
			title: 'Impersonation',
			description:
				'Do not try to impersonate others for the express intent of being deceitful, defamation , and/or personal gain.'
		},
		{
			title: 'Swearing',
			description: 'Swearing is allowed only when not used as an insult.'
		},
		{
			title: 'Only ping @emergency in emergencies',
			description:
				'Pinging <@&833802660209229854> for no reason will result in severe punishment.  <@&833802660209229854> is only to be pinged in true emergencies.'
		},
		{
			title: 'No Backseat Moderating',
			description:
				'If you see a rule being broken be broken, please report it using: `-report <user> [evidence]`.'
		},
		{
			title: 'Staff may moderate at their discretion',
			description:
				'If there are loopholes in our rules, the staff team may moderate based on what they deem appropriate. The staff team holds final discretion.'
		},
		{
			title: "Sending media that are able to crash a user's Discord",
			description:
				"Sending videos, GIFs, emojis, etc. that are able to crash someone's discord will result in a **permanent** mute that cannot be appealed."
		}
	];

	public constructor() {
		super('rule', {
			aliases: ['rule', 'rules'],
			category: "Moulberry's Bush",
			description: {
				content: 'A command to state a rule.',
				usage: 'rule <rule> [user]',
				examples: ['rule 1 IRONM00N', 'rule 2', 'rules']
			},
			args: [
				{
					id: 'rule',
					type: Argument.range('number', 1, 12, true),
					prompt: {
						start: 'What rule would you like to have cited?',
						retry: '<:no:787549684196704257> Choose a valid rule.',
						optional: true
					},
					default: undefined
				},
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to mention?',
						retry: '<:no:787549684196704257> Choose a valid user to mention.',
						optional: true
					},
					default: undefined
				}
			],
			clientPermissions: ['EMBED_LINKS', 'SEND_MESSAGES'],
			channel: 'guild'
		});
	}
	public async exec(
		message: Message,
		{ rule, user }: { rule: undefined | number; user: User }
	): Promise<unknown> {
		if (
			message.guild.id !== '516977525906341928' &&
			!this.client.ownerID.includes(message.author.id)
		) {
			return message.util.reply(
				"<:no:787549684196704257> This command can only be run in Moulberry's Bush."
			);
		}
		const rulesEmbed = new MessageEmbed()
			.setColor('ef3929')
			.setFooter(
				`Triggered by ${message.author.tag}`,
				message.author.avatarURL({ dynamic: true })
			);

		if (rule) {
			const foundRule = this.rules[rule];
			rulesEmbed.addField(foundRule.title, foundRule.description);
		} else {
			for (const curRule of this.rules) {
				rulesEmbed.addField(curRule.title, curRule.description);
			}
		}
		if (!user) {
			return (
				// If the original message was a reply -> imamate it
				message.util.send({
					embed: rulesEmbed,
					allowedMentions: AllowedMentions.users()
				})
			);
		} else {
			await message.util.send(`<@!${user.id}>`, {
				embed: rulesEmbed,
				allowedMentions: AllowedMentions.users()
			});
		}
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		await message.delete().catch(() => {});
	}
}
