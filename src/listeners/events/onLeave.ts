import { TextChannel } from 'discord.js';
import { GuildMember, MessageEmbed } from 'discord.js';
import db from '../../constants/db';
import { BotListener } from '../../extensions/BotListener';
import { stickyRoleData } from '../../extensions/mongoose';

export default class OnLeaveListener extends BotListener {
	public constructor() {
		super('OnLeaveListener', {
			emitter: 'client',
			event: 'guildMemberRemove',
			category: 'client',
		});
	}

	public async exec(member: GuildMember): Promise<void> {
		const welcomeChannel: string = await db.guildGet('welcomeChannel', member.guild.id, '737460457375268896') as string;
		if (welcomeChannel) {
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
				////this.client.userSettings.set(member.id, 'info', roles);
				////this.client.userSettings.set(member.id, 'left', Date.now());
				const ExistingData = await stickyRoleData.find({id: member.id})
				if (ExistingData.length != 0){
					const Query = await stickyRoleData.findByIdAndUpdate((ExistingData[0]['_id']), {id: member.id, left: Date.now(), roles: Array.from(member.roles.cache.keys())})
					await Query.save()
				}else {
					const roles = new stickyRoleData({id: member.id, left: Date.now(), roles: Array.from(member.roles.cache.keys())}) 
					await roles.save()
				}
			}
		
			/*const memberCount = <TextChannel>this.client.channels.cache.get('785281831788216364')
			if (memberCount.guild.memberCount.toString().endsWith('0')){
				try{
					console.log('tried to rename')
					await memberCount.setName(`Members: ${memberCount.guild.memberCount}`)
					console.log('renamed')
				}catch(e){
					console.log(e)
				}
			}*/
		}
	}
}
