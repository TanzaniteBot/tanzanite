import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import { BotListener } from '../../extensions/BotListener';
import { stripIndent } from 'common-tags';

export default class OnJoinListener extends BotListener {
	public constructor() {
		super('OnJoinListener', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'client',
		});
	}

	public async exec(member: GuildMember): Promise<void> {
		if (member.guild.id == '516977525906341928'){
			const welcome = <TextChannel>this.client.channels.cache.get('737460457375268896')
			const embed: MessageEmbed = new MessageEmbed()
				.setDescription(`:slight_smile: \`${member.user.tag}\` joined the server. There are now ${welcome.guild.memberCount.toLocaleString()} members.`)
				.setColor('7ed321')
			welcome.send(embed)
			member.roles.add(['783794633129197589','801976603772321796'], 'Join roles.')
			//const memberCount = <TextChannel>this.client.channels.cache.get('785281831788216364')
			//if (memberCount.guild.memberCount.toString().endsWith('0')||memberCount.guild.memberCount.toString().endsWith('5')){
			//	try{
			//		console.log('tried to rename')
			// eslint-disable-next-line no-irregular-whitespace
			//		await memberCount.setName(`Members: ${memberCount.guild.memberCount}`)
			//		console.log('renamed')
			//	}catch(e){
			//		console.log(e)
			//	}
			//}
			try {
				await member.send(stripIndent`**If you would like a fixed version of the mod please head over to <#693586404256645231>.**
				
				Hello, ${member.user.username}, welcome to Moulberry's Bush. 
				
				Please agree to the rules in <#740441948485189642>.
				
				If you are new to the mod, please head over to <#737444942724726915> for some basic info.
				If you face any issues, please look at <#730330815405228032> first If you can't see your issue there head over to <#714332750156660756>. Please explain your issue in detail and provide a crash report if applicable.
				We don't send notifications by default. If you want to be notified when a new version/beta is out, head over to <#702457408567640095>.
				
				*We would appreciate it if you stick around so please don't leave as soon as you download the file. :)*`)
				return
			} catch {
				const dmchannel = <TextChannel>this.client.channels.cache.get(this.client.config.dmChannel);
				const OnJoinDmError: MessageEmbed = new MessageEmbed()
					.setDescription(`There was an error DMing \`${member.user.tag}\` when trying to DM on Join`)
					.setColor(this.client.consts.ErrorColor)
				await dmchannel.send(OnJoinDmError); 
			}
		}
	}
}
