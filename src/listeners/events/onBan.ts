import { TextChannel               } from 'discord.js'                  ;
import { GuildMember, MessageEmbed } from 'discord.js'                  ;
import { BotListener               } from '../../extensions/BotListener';

export default class OnBanListener extends BotListener {
	public constructor() {
		super('OnBanListener', {
			emitter: 'client',
			event: 'guildBanAdd',
			category: 'client',
		});
	}

	public async exec(member: GuildMember): Promise<void> {
		if (member.guild.id == '516977525906341928'){
			//console.log(member.roles.cache)
			const welcome = <TextChannel>this.client.channels.cache.get('737460457375268896')			
			const embed: MessageEmbed = new MessageEmbed()
				.setDescription(`A member was banned from the server. There are now ${welcome.guild.memberCount.toLocaleString()} members.`)
				.setColor(this.client.consts.Orange)
			welcome.send(embed)
		}
	}
}
