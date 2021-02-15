/*import { BotCommand , PermissionLevel } from '../../extensions/BotCommand';
import { Message }from 'discord.js';
import { MessageEmbed } from 'discord.js';

export default class ServersCommand extends BotCommand {
	public constructor() {
		super('servers', {
			aliases: ['servers'],
			category: 'owner',
			description: {
				content: 'Displays all the severs the bot is in',
				usage: 'servers',
			},
			permissionLevel: PermissionLevel.Owner,
		});
	}
	//ported from old bot
	public async exec(message: Message): Promise<void> {
		if (!this.client.ownerID.includes(message.author.id)) return;
		const servers = this.client.guilds.cache.array().map(guild => {
			return `\`${guild.id}\` - **${guild.name}** - \`${guild.members.cache.size}\` members`
		})
		const num = servers.length / 10
		for (let i; i < num; i++) {
			const embed= new MessageEmbed();

		}
		const embed1 = new MessageEmbed()
			.setTitle('Server List')
			.setTimestamp()
		

		if (servers.length > 10){
			const embed2 = new MessageEmbed()
		}
		

		this.client.consts.paginate(message, [embed1]);

	}
}*/
