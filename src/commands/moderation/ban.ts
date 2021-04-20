import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message, GuildMember } from 'discord.js';
import { Argument } from 'discord-akairo';

export default class BanCommand extends BushCommand {
	public constructor() {
		super('ban', {
			aliases: ['ban'],
			category: 'moderation',
			description: {
				content: 'A command ban members.',
				usage: 'ban <user> [days to delete] [reason]',
				examples: ['ban @user 2 bad smh']
			},
			clientPermissions: ['BAN_MEMBERS', 'SEND_MESSAGES'],
			userPermissions: ['BAN_MEMBERS'],
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: 'What user would you like to ban?',
						retry: '<:no:787549684196704257> Choose a valid user to ban.'
					}
				},
				{
					id: 'delDuration',
					type: Argument.range('integer', 0, 7, true),
					prompt: {
						start: 'How many days of messages would you like to delete?',
						retry: '<:no:787549684196704257> Choose a number between 0 and 7.',
						optional: true
					},
					default: 0
				},
				{
					id: 'reason',
					type: 'string',
					prompt: {
						start: 'Why is the user getting banned?',
						retry: '<:no:787549684196704257> Choose a valid ban reason.',
						optional: true
					},
					default: 'No reason specified.'
				}
			],
			channel: 'guild'
		});
	}
	public async exec(message: Message, { member, delDuration, reason }: { member: GuildMember; delDuration: number; reason: string }): Promise<Message> {
		let reason1: string;
		if (reason == 'No reason specified.') reason1 = `No reason specified. Responsible moderator: ${message.author.username}`;
		else reason1 = `${reason}. Responsible moderator: ${message.author.username}`;
		if (message.member.roles.highest.position <= member.roles.highest.position && !this.client.config.owners.includes(message.author.id)) {
			return message.util.reply(`<:no:787549684196704257> \`${member.user.tag}\` has higher role hierarchy than you.`);
		}
		if (!member?.bannable) return message.util.reply(`<:no:787549684196704257> \`${member.user.tag}\` has higher role hierarchy than me.`);
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const banned = await member.ban({ days: delDuration, reason: reason1 }).catch(() => {});
		if (!banned) return message.util.reply(`<:no:787549684196704257> There was an error banning \`${member.user.tag}\`.`);
		else return message.util.reply(`<:yes:787549618770149456> \`${member.user.tag}\` has been banned.`);
	}
}
