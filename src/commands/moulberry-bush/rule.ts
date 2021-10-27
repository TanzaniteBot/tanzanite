import { AllowedMentions, BushCommand, BushMessage } from '@lib';
import { MessageEmbed, User } from 'discord.js';

const rules = [
	{
		title: "1.) Follow Discord's TOS",
		description:
			"Be sure to follow discord's TOS found at <https://discordapp.com/tos>, you must be 13 to use discord so if you admit to being under 13 you will be banned from the server."
	},
	{
		title: '2.) Be Respectful',
		description:
			'Racist, sexist, homophobic, xenophobic, transphobic, ableist, hate speech, slurs, or any other derogatory, toxic, or discriminatory behavior will not be tolerated.'
	},
	{
		title: '3.) No Spamming',
		description:
			'Including but not limited to: any messages that do not contribute to the conversation, repeated messages, randomly tagging users, and chat flood.'
	},
	{
		title: '4.) English',
		description: 'The primary language of the server is English, please keep all discussions in English.'
	},
	{
		title: '5.) Safe for Work',
		description:
			'Please keep NSFW and NSFL content out of this server, avoid borderline images as well as keeping your status, profile picture, and banner SFW.'
	},
	{
		title: '6.) No Advertising',
		description: 'Do not promote anything without prior approval from a staff member, this includes DM advertising.'
	},
	{
		title: '7.) Impersonation',
		description: 'Do not try to impersonate others for the express intent of being deceitful, defamation , and/or personal gain.'
	},
	{ title: '8.) Swearing', description: 'Swearing is allowed only when not used as an insult.' },
	{
		title: "9.) Sending media that are able to crash a user's Discord",
		description:
			"Sending videos, GIFs, emojis, etc. that are able to crash someone's discord will result in a **permanent** ban that cannot be appealed."
	},
	{
		title: '10.) No Backseat Moderating',
		description: 'If you see a rule being broken be broken, please report it using: `-report <user> [evidence]`.'
	},
	{
		title: '11.) Staff may moderate at their discretion',
		description:
			'If there are loopholes in our rules, the staff team may moderate based on what they deem appropriate. The staff team holds final discretion.'
	}
];
export default class RuleCommand extends BushCommand {
	public constructor() {
		super('rule', {
			aliases: ['rule', 'rules'],
			category: "Moulberry's Bush",
			description: {
				content: 'A command to state a rule.',
				usage: ['rule <rule> [user]'],
				examples: ['rule 1 IRONM00N', 'rule 2', 'rules']
			},
			args: [
				{
					id: 'rule',
					customType: util.arg.range('integer', 1, rules.length, true),
					prompt: {
						start: 'What rule would you like to have cited?',
						retry: '{error} Choose a valid rule.',
						optional: true
					}
				},
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to mention?',
						retry: '{error} Choose a valid user to mention.',
						optional: true
					}
				}
			],
			slash: true,
			slashOptions: [
				{
					name: 'rule',
					description: 'The rule you would you like to have cited',
					type: 'INTEGER',
					required: false
				},
				{
					name: 'user',
					description: 'The user you would like to mention.',
					type: 'USER',
					required: false
				}
			],
			slashGuilds: ['516977525906341928'],
			channel: 'guild',
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['EMBED_LINKS'], true),
			userPermissions: [],
			restrictedGuilds: ['516977525906341928']
		});
	}

	public override async exec(message: BushMessage, { rule, user }: { rule: undefined | number; user: User }) {
		const rulesEmbed = new MessageEmbed()
			.setColor('#ef3929')
			.setFooter(`Triggered by ${message.author.tag}`, message.author.avatarURL({ dynamic: true }) ?? undefined)
			.setTimestamp();

		if (rule !== undefined && (rule > 12 || rule < 1)) {
			rule = undefined;
		}
		if (rule) {
			if (rules[rule - 1]?.title && rules[rule - 1]?.description)
				rulesEmbed.addField(rules[rule - 1].title, rules[rule - 1].description);
		} else {
			for (let i = 0; i < rules.length; i++) {
				if (rules[i]?.title && rules[i]?.description) rulesEmbed.addField(rules[i].title, rules[i].description);
			}
		}
		await respond();
		if (!message.util.isSlash) {
			await message.delete().catch(() => {});
		}
		return;
		async function respond() {
			if (!user) {
				return (
					// If the original message was a reply -> imitate it
					message.reference?.messageId && !message.util.isSlash
						? await message.channel.messages.fetch(message.reference.messageId).then(async (message) => {
								await message.reply({ embeds: [rulesEmbed], allowedMentions: AllowedMentions.users() });
						  })
						: await message.util.send({ embeds: [rulesEmbed], allowedMentions: AllowedMentions.users() })
				);
			} else {
				return message.reference?.messageId && !message.util.isSlash
					? await message.util.send({
							content: `<@!${user.id}>`,
							embeds: [rulesEmbed],
							allowedMentions: AllowedMentions.users(),
							reply: { messageReference: message.reference.messageId }
					  })
					: await message.util.send({
							content: `<@!${user.id}>`,
							embeds: [rulesEmbed],
							allowedMentions: AllowedMentions.users()
					  });
			}
		}
	}
}
