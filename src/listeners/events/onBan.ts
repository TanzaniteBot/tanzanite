import { TextChannel, Guild, GuildMember, MessageEmbed } from 'discord.js';
import { BotListener } from '../../extensions/BotListener';

export default class OnBanListener extends BotListener {
	public constructor() {
		super('OnBanListener', {
			emitter: 'client',
			event: 'guildBanAdd',
			category: 'client',
		});
	}

	public async exec(member: GuildMember, guild: Guild): Promise<void> {
		if (guild.id == '516977525906341928'){
			//This is where I would put the member's cached roles in the database
			const welcome = <TextChannel>this.client.channels.cache.get('737460457375268896')			
			const embed: MessageEmbed = new MessageEmbed()
				.setDescription(`A member was banned from the server. There are now ${welcome.guild.memberCount.toLocaleString()} members.`)
				.setColor(this.client.consts.Orange)
			welcome.send(embed)
		}
	}
}
