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
		const welcomeChannel = await this.client.guildSettings.get(member.guild.id, 'welcomeChannel', undefined)

		if (welcomeChannel !== undefined) {
			const welcome = <TextChannel>this.client.channels.cache.get(welcomeChannel)
			const embed: MessageEmbed = new MessageEmbed()
				.setDescription(`:cry: \`${member.user.tag}\` left the server. There are now ${welcome.guild.memberCount.toLocaleString()} members.`)
				.setColor('d0021b')
			welcome.send(embed)
		}	

		if (member.guild.id == '516977525906341928'){
			const roles = Array.from(member.roles.cache.keys())
			////console.log(`${member.user.tag} left with: ${Array.from(member.roles.cache.keys())}`);
			if (roles !== undefined){
				this.client.userSettings.set(member.id, 'info', roles);
				this.client.userSettings.set(member.id, 'left', Date.now());
			}
		




			//const memberCount = <TextChannel>this.client.channels.cache.get('785281831788216364')
			//if (memberCount.guild.memberCount.toString().endsWith('0')){
			//	try{
			//		console.log('tried to rename')
			// eslint-disable-next-line no-irregular-whitespace
			//		await memberCount.setName(`Members: ${memberCount.guild.memberCount}`)
			//		console.log('renamed')
			//	}catch(e){
			//		console.log(e)
			//	}
			//}
		}
	}
}
