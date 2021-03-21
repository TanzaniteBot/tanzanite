import { BushCommand } from '../../lib/extensions/BushCommand';
import AllowedMentions from '../../lib/utils/AllowedMentions';
import { Message, MessageEmbed, User } from 'discord.js';
import { Argument } from 'discord-akairo';

export default class ReportCommand extends BushCommand {
	public constructor() {
		super('report', {
			aliases: ['report'],
			category: "Moulberry's Bush",
			description: {
				content: 'A command to state a rule.',
				usage: 'rule <user> <user>',
				examples: ['rule 1 IRONM00N', 'rule 2', 'rules']
			},
			args: [
				{
					id: 'user',
					type: 'user',
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
	public async exec(message: Message, { rule, user }: { rule: undefined | number; user: User }): Promise<void> {
		if (message.guild.id != '516977525906341928'){
			await message.reply('<:no:787549684196704257> This command can only be run in Moulberry\'s bush.')
			return
		}
		
	}
}
