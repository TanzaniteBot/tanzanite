import { BushCommand } from '../../lib/extensions/BushCommand';
import AllowedMentions from '../../lib/utils/AllowedMentions';
import { Message, MessageEmbed, User } from 'discord.js';
import { Argument } from 'discord-akairo';
export default class RuleCommand extends BushCommand {
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
	public async exec(message: Message, { rule, user }: { rule: undefined | number; user: User }): Promise<unknown> {
		if (message.guild.id !== '516977525906341928' && !this.client.ownerID.includes(message.author.id)) {
			return message.util.reply("<:no:787549684196704257> This command can only be run in Moulberry's Bush.");
		}
		const rulesEmbed = new MessageEmbed().setColor('ef3929').setFooter(`Triggered by ${message.author.tag}`, message.author.avatarURL({ dynamic: true }));
		const rules = {
			t1: "1.) Follow Discord's TOS",
			d1:
				"Be sure to follow discord's TOS found at <https://discordapp.com/tos>, you must be 13 to use discord so if you admit to being under 13 you will be banned from the server.",
			t2: '2.) Be Respectful',
			d2:
				'Racist, sexist, homophobic, xenophobic, transphobic, ableist, hate speech, slurs, or any other derogatory, toxic, or discriminatory behavior will not be tolerated.',
			t3: '3.) No Spamming',
			d3: 'Including but not limited to: any messages that do not contribute to the conversation, repeated messages, randomly tagging users, and chat flood.',
			t4: '4.) English',
			d4: 'The primary language of the server is English, please keep all discussions in English.',
			t5: '5.) Safe for Work',
			d5: 'Please keep NSFW and NSFL content out of this server, avoid borderline images as well as keeping your status and profile picture SFW.',
			t6: '6.) No Advertising',
			d6: 'Do not promote anything without prior approval from a staff member, this includes DM advertising.',
			t7: '7.) Impersonation',
			d7: 'Do not try to impersonate others for the express intent of being deceitful, defamation , and/or personal gain.',
			t8: '8.) Swearing',
			d8: 'Swearing is allowed only when not used as an insult.',
			t9: '9.) Only ping @emergency in emergencies',
			d9: 'Pinging <@&833802660209229854> for no reason will result in severe punishment.  <@&833802660209229854> is only to be pinged in true emergencies.',
			t10: '10.) No Backseat Moderating',
			d10: 'If you see a rule being broken be broken, please report it using: `-report <user> [evidence]`.',
			t11: '11.) Staff may moderate at their discretion',
			d11: 'If there are loopholes in our rules, the staff team may moderate based on what they deem appropriate. The staff team holds final discretion.',
			t12: "12.) Sending media that are able to crash a user's Discord",
			d12: "Sending videos, GIFs, emojis, etc. that are able to crash someone's discord will result in a **permanent** mute that cannot be appealed."
		};

		if (rule) {
			rulesEmbed.addField(rules[`t${rule}`], rules[`d${rule}`]);
		} else {
			for (let i = 1; i <= 12; i++) {
				rulesEmbed.addField(rules[`t${i}`], rules[`d${i}`]);
			}
		}
		await respond();
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		await message.delete().catch(() => {});
		function respond(): unknown {
			if (!user) {
				return (
					// If the original message was a reply -> imamate it
					message.referencedMessage?.reply({ embed: rulesEmbed, allowedMentions: AllowedMentions.users() }) ||
					message.util.send({ embed: rulesEmbed, allowedMentions: AllowedMentions.users() })
				);
			} else {
				return (
					message.referencedMessage?.reply(`<@!${user.id}>`, { embed: rulesEmbed, allowedMentions: AllowedMentions.users() }) ||
					message.util.send(`<@!${user.id}>`, { embed: rulesEmbed, allowedMentions: AllowedMentions.users() })
				);
			}
		}
	}
}
