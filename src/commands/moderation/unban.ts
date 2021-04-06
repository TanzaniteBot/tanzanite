import { Message, User } from 'discord.js';
import { BushCommand } from '../../lib/extensions/BushCommand';

export default class UnBanCommand extends BushCommand {
	public constructor() {
		super('unban', {
			aliases: ['unban'],
			category: 'moderation',
			description: {
				content: 'A command unban members.',
				usage: 'unban <user>',
				examples: ['unban 322862723090219008']
			},
			clientPermissions: ['BAN_MEMBERS', 'SEND_MESSAGES'],
			userPermissions: ['BAN_MEMBERS'],
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to unban?',
						retry: '<:no:787549684196704257> Choose a valid user to ban.'
					}
				},
				{
					id: 'reason',
					type: 'string',
					prompt: {
						start: 'Why is the user getting unbanned?',
						retry: '<:no:787549684196704257> Choose a valid unban reason.',
						optional: true
					},
					default: 'No reason specified.'
				}
			],
			channel: 'guild'
		});
	}
	public async exec(
		message: Message,
		{ user, reason }: { user: User; reason: string }
	): Promise<Message> {
		let reason1: string;
		if (reason == 'No reason specified.')
			reason1 = `No reason specified. Responsible moderator: ${message.author.username}`;
		else reason1 = `${reason}. Responsible moderator: ${message.author.username}`;
		const ban = await message.guild.fetchBan(user);
		if (!ban)
			return message.util.reply(
				`<:no:787549684196704257> \`${user.tag}\` does not appear to be banned.`
			);
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const unbanned = await message.guild.members.unban(user, reason1).catch(() => {});
		if (!unbanned)
			return message.util.reply(
				`<:no:787549684196704257> There was an error unbanning \`${user.tag}\`.`
			);
		else return message.util.reply(`<:yes:787549618770149456> \`${user.tag}\` has been banned.`);
	}
}
