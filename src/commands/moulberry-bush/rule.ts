import {
	AllowedMentions,
	Arg,
	BushCommand,
	clientSendAndPermCheck,
	type CommandMessage,
	type OptArgType,
	type SlashMessage
} from '#lib';
import { ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { stripIndent } from '../../lib/common/tags.js';

const rules = [
	{
		title: "1.) Follow Discord's TOS",
		description: stripIndent`
			Be sure to follow discord's TOS found at <https://discordapp.com/tos>,\
			you must be 13 to use discord so if you admit to being under 13 you will be banned from the server.`
	},
	{
		title: '2.) Be Respectful',
		description: stripIndent`
			Racist, sexist, homophobic, xenophobic, transphobic, ableist, hate speech, slurs, or any other derogatory, \
			toxic, or discriminatory behavior will not be tolerated.`
	},
	{
		title: '3.) No Spamming',
		description: stripIndent`
			Including but not limited to: any messages that do not contribute to the conversation, repeated messages, \
			linebreaking, randomly tagging users, and chat flood.`
	},
	{
		title: '4.) English',
		description: 'The primary language of the server is English, please keep all discussions in English.'
	},
	{
		title: '5.) Safe for Work',
		description: stripIndent`
			Please keep NSFW and NSFL content out of this server, avoid borderline images as well as keeping your status, \
			profile picture, and banner SFW.`
	},
	{
		title: '6.) No Advertising',
		description: 'Do not promote anything without prior approval from a staff member, this includes DM advertising.'
	},
	{
		title: '7.) Impersonation',
		description: 'Do not try to impersonate others for the express intent of being deceitful, defamation, and/or personal gain.'
	},
	{ title: '8.) Swearing', description: 'Swearing is allowed only when not used as an insult.' },
	{
		title: "9.) Sending media that are able to crash a user's Discord",
		description: stripIndent`
			Sending videos, GIFs, emojis, etc. that are able to crash someone's discord will result in a \
			**permanent** ban that cannot be appealed.`
	},
	{
		title: '10.) No Backseat Moderating',
		description: 'If you see a rule being broken be broken, please report it using: `-report <user> [evidence]`.'
	},
	{
		title: '11.) Staff may moderate at their discretion',
		description: stripIndent`
			If there are loopholes in our rules, the staff team may moderate based on what they deem appropriate. \
			The staff team holds final discretion.`
	}
];

export default class RuleCommand extends BushCommand {
	public constructor() {
		super('rule', {
			aliases: ['rule', 'rules'],
			category: "Moulberry's Bush",
			description: 'A command to state a rule.',
			usage: ['rule <rule> [user]'],
			examples: ['rule 1 IRONM00N', 'rule 2', 'rules'],
			args: [
				{
					id: 'rule',
					description: 'The rule to view.',
					type: Arg.range('integer', 1, rules.length, true),
					readableType: 'integer',
					prompt: 'What rule would you like to have cited?',
					retry: '{error} Choose a valid rule.',
					optional: true,
					slashType: ApplicationCommandOptionType.Integer,
					minValue: 1,
					maxValue: rules.length
				},
				{
					id: 'user',
					description: 'The user to mention.',
					type: 'user',
					prompt: 'What user would you like to mention?',
					retry: '{error} Choose a valid user to mention.',
					optional: true,
					slashType: ApplicationCommandOptionType.User
				}
			],
			slash: true,
			slashGuilds: ['516977525906341928'],
			channel: 'guild',
			clientPermissions: (m) => clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: [],
			restrictedGuilds: ['516977525906341928']
		});
	}

	public override async exec(
		message: CommandMessage | SlashMessage,
		{ rule, user }: { rule: OptArgType<'integer'>; user: OptArgType<'user'> }
	) {
		const rulesEmbed = new EmbedBuilder()
			.setColor(0xef3929)
			.setFooter({
				text: `Triggered by ${message.author.tag}`,
				iconURL: message.author.avatarURL() ?? undefined
			})
			.setTimestamp();

		if (rule != null && (rule > 12 || rule < 1)) {
			rule = null;
		}
		if (rule) {
			if (rules[rule - 1]?.title && rules[rule - 1]?.description)
				rulesEmbed.addFields([{ name: rules[rule - 1].title, value: rules[rule - 1].description }]);
		} else {
			for (let i = 0; i < rules.length; i++) {
				if (rules[i]?.title && rules[i]?.description)
					rulesEmbed.addFields([{ name: rules[i].title, value: rules[i].description }]);
			}
		}
		await message.util.send({
			content: user ? `<@${user.id}>` : undefined,
			embeds: [rulesEmbed],
			allowedMentions: AllowedMentions.users(),
			// If the original message was a reply -> imitate it
			reply:
				!message.util.isSlashMessage(message) && message.reference?.messageId
					? { messageReference: message.reference.messageId }
					: undefined
		});
		if (!message.util.isSlash) {
			await message.delete().catch(() => {});
		}
	}
}
