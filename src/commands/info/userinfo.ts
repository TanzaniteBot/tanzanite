import { Message,  User, MessageEmbed } from 'discord.js';
import { BotCommand } from '../../extensions/BotCommand';

export default class UserinfoCommand extends BotCommand {
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
				content: "Gives the status of moulberry's server",
			},
			args: [
				{
					id: 'user',
					type: 'user',
					default: null,
				},
			],
		});
	}
	public exec(message: Message, { user }: { user: User }): void {
		message.util.send('you are a user :)'); //bruh
		let m;
		if (user === null) {
			m = message.author;
		} else {
			m = user;
		}

		const embed: MessageEmbed = new MessageEmbed().setDescription('soon:tm:').addField('info', `mention: <@${m.id}>`);
		//.setThumbnail(m.displayAvatarURL)
		message.util.send(embed);
	}
}
