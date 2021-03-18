import { Message, User, MessageEmbed } from 'discord.js';
import { BotCommand } from '../../lib/extensions/BotCommand';

export default class KickCommand extends BotCommand {
	public constructor() {
		super('kick', {
			aliases: ['kick'],
			category: 'moderation',
			description: {
				content: 'A command kick members.',
				usage: 'kick <user> [reason]',
				examples: ['kick @user bad smh']
			},
			clientPermissions: ['KICK_MEMBERS', 'EMBED_LINKS', 'SEND_MESSAGES'],
			userPermissions: ['KICK_MEMBERS'],
			args: [
				{
					id: 'user',
					type: 'user',
					prompt: {
						start: 'What user would you like to kick?',
						retry: '<:no:787549684196704257> Choose a valid user to kick.'
					}
				},
				{
					id: 'reason',
					type: 'string',
					prompt: {
						start: 'Why is the user getting kicked?',
						retry: '<:no:787549684196704257> Choose a valid kick reason.',
						optional: true
					},
					default: 'No reason specified.'
				}
			],
			channel: 'guild'
		});
	}
	public async exec(message: Message, { user, reason }: { user: User; reason: string }): Promise<void> {
		let reason1: string;
		if (reason == 'No reason specified.') reason1 = `No reason specified. Responsible user: ${message.author.username}`;
		else {
			reason1 = `${reason} Responsible user: ${message.author.username}`;
		}
		const member = message.guild.members.resolve(user);
		if (member.id === '464970779944157204' && !this.client.config.owners.includes(message.author.id)) {
			return;
		}
		if (!member.kickable) {
			const errorKickEmbed = new MessageEmbed().setDescription(`<:no:787549684196704257> \`${user.tag}\` Could not be kicked.`).setColor(this.client.consts.ErrorColor);
			await message.util.reply(errorKickEmbed);
			return;
		}
		await member.kick(reason1);
		const kickEmbed = new MessageEmbed().setDescription(`:boot: \`${user.tag}\` Has been kicked.`).setColor(this.client.consts.SuccessColor);
		await message.util.reply(kickEmbed);
	}
}
