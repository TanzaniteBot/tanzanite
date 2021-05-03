import { GuildMember } from 'discord.js';
import { Message, User, MessageEmbed } from 'discord.js';
import { BushCommand } from '../../lib/extensions/BushCommand';

export default class UserinfoCommand extends BushCommand {
	public constructor() {
		super('userinfo', {
			aliases: ['userinfo'],
			category: 'info',
			ratelimit: 4,
			cooldown: 4000,
			clientPermissions: ['EMBED_LINKS'],
			description: {
				usage: 'userinfo',
				examples: ['userinfo'],
				content: 'Gives information about a specified user.'
			},
			args: [
				{
					id: 'user',
					type: 'member',
					default: null
				}
			]
		});
	}
	//TODO: Make this an actual command
	public exec(message: Message, { user }: { user: GuildMember }): void {
		message.util.reply('you are a user :)');
		let m:GuildMember;
		if (!user) {
			m = message.member;
		} else {
			m = user;
		}

		const embed: MessageEmbed = new MessageEmbed().setDescription('soon:tm:').addField('info', `mention: <@${m.id}>`);
		//.setThumbnail(m.displayAvatarURL)
		message.util.reply(embed);
	}
}
