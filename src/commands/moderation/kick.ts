import { BushCommand } from '../../lib/extensions/BushCommand';
import { Message, GuildMember } from 'discord.js';

export default class KickCommand extends BushCommand {
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
					id: 'member',
					type: 'member',
					prompt: {
						start: 'What user would you like to kick?',
						retry: '<:error:837123021016924261> Choose a valid user to kick.'
					}
				},
				{
					id: 'reason',
					type: 'string',
					prompt: {
						start: 'Why is the user getting kicked?',
						retry: '<:error:837123021016924261> Choose a valid kick reason.',
						optional: true
					},
					default: 'No reason specified.'
				}
			],
			channel: 'guild'
		});
	}
	public async exec(message: Message, { member, reason }: { member: GuildMember; reason: string }): Promise<Message> {
		let reason1: string;
		if (reason == 'No reason specified.') reason1 = `No reason specified. Responsible moderator: ${message.author.username}`;
		else reason1 = `${reason}. Responsible moderator: ${message.author.username}`;
		if (message.member.roles.highest.position <= member.roles.highest.position && !this.client.config.owners.includes(message.author.id)) {
			return message.util.reply(`<:error:837123021016924261> \`${member.user.tag}\` has higher role hierarchy than you.`);
		}
		if (!member?.kickable) return message.util.reply(`<:error:837123021016924261> \`${member.user.tag}\` has higher role hierarchy than me.`);
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const kicked = await member.kick(reason1).catch(() => {});
		if (!kicked) return message.util.reply(`<:error:837123021016924261> There was an error kicking \`${member.user.tag}\`.`);
		else return message.util.reply(`<:checkmark:837109864101707807> \`${member.user.tag}\` has been kicked.`);
	}
}
