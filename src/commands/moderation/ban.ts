import { Message   , TextChannel, User, MessageEmbed } from 'discord.js'                 ;
import { BotCommand                                  } from '../../extensions/BotCommand';

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
					prompt: {
						start: 'Why is the user getting banned?',
						optional: true
					},
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
		
		const member = message.guild.members.resolve(user);
		if (!member.bannable){
			const errorBanEmbed = new MessageEmbed().setDescription(`:x: \`${user.tag}\` Could not be banned.`).setColor(this.client.consts.ErrorColor);
			await message.channel.send(errorBanEmbed)
			return;
		}
		await member.ban({
			days: delDuration,
			reason: reason1,
		});
		const BanEmbed = new MessageEmbed().setDescription(`:hammer: \`${user.tag}\` Has been banned.`).setColor(this.client.consts.SuccessColor);
		await message.util.send(BanEmbed);
	}
}
