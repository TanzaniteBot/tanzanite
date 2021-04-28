import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message, GuildMember } from 'discord.js';

export default class NickCommand extends BushCommand {
	public constructor() {
		super('nick', {
			aliases: ['nick', 'newnick', 'nickname'],
			category: 'moderation',
			description: {
				content: "A command to change a user's nickname.",
				usage: 'nick <user> [nick]',
				examples: ['nick @user Please Get A New Nick']
			},
			clientPermissions: ['MANAGE_NICKNAMES', 'EMBED_LINKS', 'SEND_MESSAGES'],
			userPermissions: ['MANAGE_NICKNAMES'],
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: 'What user would you like to nickname?',
						retry: '<:no:787549684196704257> Choose a valid user to change the nickname of.'
					}
				},
				{
					id: 'nick',
					type: 'string',
					prompt: {
						start: 'What should the user be nicknamed?',
						retry: '<:no:787549684196704257> Pick a valid new nickname.',
						optional: true
					},
					default: 'Moderated Nickname'
				}
			],
			channel: 'guild'
		});
	}
	public async exec(message: Message, { member, nick }: { member: GuildMember; nick: string }): Promise<Message> {
		if (message.member.roles.highest.position <= member.roles.highest.position && !this.client.config.owners.includes(message.author.id)) {
			return message.util.reply(`<:no:787549684196704257> \`${member.user.tag}\` has higher role hierarchy than you.`);
		}
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const nicked = await member.setNickname(nick, `Responsible moderator: ${message.author.tag}.`).catch(() => {});
		if (!nicked) return message.util.reply(`<:no:787549684196704257> There was an error changing the nickname of \`${member.user.tag}\`.`);
		else return message.util.reply(`<:checkmark:837109864101707807> \`${member.user.tag}\`'s nickname has been changed to \`${nick}\`.`);
	}
}
