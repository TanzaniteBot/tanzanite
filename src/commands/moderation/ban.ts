import { Message, TextChannel, User, MessageEmbed } from 'discord.js';
import { BotCommand } from '../../extensions/BotCommand';

export default class BanCommand extends BotCommand {
	public constructor() {
		super('ban', {
			aliases: ['ban'],
			category: 'moderation',
			description: {
				content: 'A command ban members.',
				usage: 'ban <user> [days to delete] [reason]',
				examples: ['ban @user 2 bad smh'],
			},
			clientPermissions: ['BAN_MEMBERS', 'EMBED_LINKS'],
			userPermissions: ['BAN_MEMBERS'],
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to ban?',
					},
				},
				{
					id: 'delDuration',
					type: 'number',
					default: '0',
				},
				{
					id: 'reason',
					type: 'string',
					/*prompt: {
						start: 'Why is the user getting banned?'
					},*/
					default: 'No reason specified.',
				},
			],
			channel: 'guild',
		});
	}
	public async exec(message: Message, { user, delDuration, reason }: { user: User; delDuration: number; reason: string }): Promise<void> {
		if (delDuration == null) {
			delDuration = 0;
		}
		let reason1: string;
		if (reason == 'No reason specified.') reason1 = `No reason specified. Responsible user: ${message.author.username}`;
		else {
			reason1 = `${reason} Responsible user: ${message.author.username}`;
		}

		if (delDuration > 7 || delDuration < 0) {
			await message.util.send('Please provide a valid number of days to delete (between 0 - 7 days).');
			return;
		}

		try {
			const member = message.guild.members.resolve(user);
			await member.ban({
				days: delDuration,
				reason: reason1,
			});
			const BanEmbed = new MessageEmbed().setDescription(`${user.username} Has been banned.`).setColor(this.client.consts.SuccessColor);
			await message.util.send(BanEmbed);
		} catch (e) {
			const generalLogChannel = <TextChannel>this.client.channels.cache.get(this.client.config.generalLogChannel);
			await generalLogChannel.send(e);
		}
	}
}
