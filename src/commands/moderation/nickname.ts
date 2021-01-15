import { BotCommand } from '../../classes/BotCommand';
import { Message } from 'discord.js';
import { User } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import { TextChannel } from 'discord.js';

export default class NickCommand extends BotCommand {
	public constructor() {
		super('nick', {
			aliases: ['nick'],
			category: 'moderation',
			description: {
				content: "A command to change a user's nickname.",
				usage: 'nick <user> [nick]',
				examples: ['nick @user Please Get A New Name'],
			},
			clientPermissions: ['MANAGE_NICKNAMES', 'EMBED_LINKS'],
			userPermissions: ['MANAGE_NICKNAMES'],
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to nickname?',
					},
				},
				{
					id: 'nick',
					type: 'string',
					prompt: {
						start: 'What should the user be nicknamed?',
					},
					default: 'Moderated Nickname',
				},
			],
			channel: 'guild',
		});
	}
	public async exec(message: Message, { user, nick }: { user: User; nick: string }): Promise<void> {
		try {
			const member = message.guild.members.resolve(user);
			await member.setNickname(nick);
			const BanEmbed = new MessageEmbed()
				.setDescription(`${user.tag}'s nickname has been changed to ${nick}.`)
				.setColor(this.client.consts.SuccessColor);
			message.util.send(BanEmbed);
		} catch (e) {
			const generalLogChannel = <TextChannel>this.client.channels.cache.get(this.client.config.generalLogChannel);
			generalLogChannel.send(e);
		}
	}
}
