/* eslint-disable quotes */
import { BotCommand } from '../../extensions/BotCommand';
import AllowedMentions from '../../extensions/AllowedMentions';
import { Message, MessageEmbed, User } from 'discord.js';
import { Argument } from 'discord-akairo';

export default class RuleCommand extends BotCommand {
	public constructor() {
		super('rule', {
			aliases: ['rule', 'rules'],
			category: 'mb',
			description: {
				content: 'A command to state a rule.',
				usage: 'rule <rule> <user>',
				examples: ['rule 1 IRONM00N', 'rule 2', 'rules']
			},
			args: [
				{
					id: 'rule',
					type: Argument.range('number', 1, 11, true),
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
			clientPermissions: ['EMBED_LINKS'],
			channel: 'guild'
		});
	}
	public async exec(message: Message, { rule, user }: { rule: undefined | number; user: User }): Promise<void> {
		if (message.guild.id !== '516977525906341928') {
			await message.util.reply("<:no:787549684196704257> This command can only be run in Moulberry's Bush.");
			return;
		}
		const rulesEmbed = new MessageEmbed().setColor('ef3929'),
			rule1a = "1.) Follow Discord's TOS",
			rule1b = "Be sure to follow discord's TOS found at <https://discordapp.com/tos>, you must be 13 to use discord so if you admit to being under 13 you will be banned from the server.",
			rule2a = '2.) Be Respectful',
			rule2b = 'Racist, sexist, homophobic, xenophobic, transphobic, ableist, hate speech, slurs, or any other derogatory, toxic, or discriminatory behavior will not be tolerated.',
			rule3a = '3.) No Spamming',
			rule3b = 'Including but not limited to: any messages that do not contribute to the conversation, repeated messages, randomly tagging users, and chat flood.',
			rule4a = '4.) English',
			rule4b = 'The primary language of the server is English, please keep all discussions in English.',
			rule5a = '5.) Safe for Work',
			rule5b = 'Please keep NSFW and NSFL content out of this server, avoid borderline images as well as keeping your status and profile picture SFW.',
			rule6a = '6.) No Advertising',
			rule6b = 'Do not promote anything without prior approval from a staff member, this includes DM advertising.',
			rule7a = '7.) Impersonation',
			rule7b = 'Do not try to impersonate others for the express intent of being deceitful, defamation , and/or personal gain.',
			rule8a = '8.) Swearing',
			rule8b = 'Swearing is allowed only when not used as an insult.',
			rule9a = '9.) Only ping @Emergency in emergencies',
			rule9b = 'Pinging <@&791042123608752181> for no reason will result in severe punishment.  <@&791042123608752181> is only to be pinged in true emergencies.',
			rule10a = '10.) No Backseat Moderating',
			rule10b = 'If you see a rule being broken be broken, please report it using:`!report <message link>`.',
			rule11a = '11.) Staff may moderate at their discretion',
			rule11b = 'If there are loopholes in our rules, the staff team may moderate based on what they deem appropriate. The staff team holds final discretion.';
		if (rule) {
			switch (rule) {
				case 1:
					rulesEmbed.addField(rule1a, rule1b);
					break;
				case 2:
					rulesEmbed.addField(rule2a, rule2b);
					break;
				case 3:
					rulesEmbed.addField(rule3a, rule3b);
					break;
				case 4:
					rulesEmbed.addField(rule4a, rule4b);
					break;
				case 5:
					rulesEmbed.addField(rule5a, rule5b);
					break;
				case 6:
					rulesEmbed.addField(rule6a, rule6b);
					break;
				case 7:
					rulesEmbed.addField(rule7a, rule7b);
					break;
				case 8:
					rulesEmbed.addField(rule8a, rule8b);
					break;
				case 9:
					rulesEmbed.addField(rule9a, rule9b);
					break;
				case 10:
					rulesEmbed.addField(rule10a, rule10b);
					break;
				case 11:
					rulesEmbed.addField(rule11a, rule11b);
					break;
			}
		} else {
			rulesEmbed.addField(rule1a, rule1b).addField(rule2a, rule2b).addField(rule3a, rule3b).addField(rule4a, rule4b).addField(rule5a, rule5b).addField(rule6a, rule6b).addField(rule7a, rule7b).addField(rule8a, rule8b).addField(rule9a, rule9b).addField(rule10a, rule10b).addField(rule11a, rule11b);
		}
		if (!user) {
			await message.util.reply(rulesEmbed);
			return;
		} else {
			await message.util.reply(`<@!${user.id}>`, {
				embed: rulesEmbed,
				allowedMentions: AllowedMentions.users()
			});
			return;
		}
	}
}
