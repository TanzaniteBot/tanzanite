import { Message, User, MessageEmbed, TextChannel } from 'discord.js';
import { BotCommand } from '../../extensions/BotCommand';

export default class NickCommand extends BotCommand {
	public constructor() {
		super('nick', {
			aliases: ['nick', 'newNick'],
			category: 'moderation',
			description: {
				content: "A command to change a user's nickname.",
				usage: 'nick <user> [nick]',
				examples: ['nick @user Please Get A New Name']
			},
			clientPermissions: ['MANAGE_NICKNAMES', 'EMBED_LINKS'],
			userPermissions: ['MANAGE_NICKNAMES'],
			args: [
				{
					id: 'user',
					type: 'user',
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
	public async exec(message: Message, { user, nick }: { user: User; nick: string }): Promise<void> {
		const member = message.guild.members.resolve(user);

		try {
			await member.setNickname(nick, `Changed by ${message.author.tag}.`);
			const NickEmbed = new MessageEmbed().setDescription(`${user.tag}'s nickname has been changed to \`${nick}\`.`).setColor(this.client.consts.SuccessColor);
			await message.util.reply(NickEmbed);
		} catch {
			const NickError = new MessageEmbed().setDescription(`<:no:787549684196704257> Could not change the nickname of \`${user.tag}\`.`).setColor(this.client.consts.ErrorColor);
			await message.util.reply(NickError);
		}
	}
}
