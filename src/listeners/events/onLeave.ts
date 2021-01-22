import { TextChannel } from 'discord.js';
import { GuildMember, MessageEmbed } from 'discord.js';
import { BotListener } from '../../extensions/BotListener';

export default class OnLeaveListener extends BotListener {
	public constructor() {
		super('OnLeaveListener', {
			emitter: 'client',
			event: 'guildMemberRemove',
			category: 'client',
		});
	}

	public async exec(member: GuildMember): Promise<void> {
		
		const welcome = <TextChannel>this.client.channels.cache.get('737460457375268896')
		const embed: MessageEmbed = new MessageEmbed()
			.setDescription(`:cry: \`${member.user.tag}\` left the server. There are now ${welcome.guild.memberCount.toLocaleString()} members.`)
			.setColor('d0021b')
		welcome.send(embed)
	}
}
