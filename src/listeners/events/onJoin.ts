import { GuildMember, MessageEmbed, TextChannel } from 'discord.js';
import moment from 'moment';
import db from '../../constants/db';
import { BotListener } from '../../extensions/BotListener';
import { stickyRoleDataSchema } from '../../extensions/mongoose';
////import { stripIndent} from 'common-tags';


export default class OnJoinListener extends BotListener {
	public constructor() {
		super('OnJoinListener', {
			emitter: 'client',
			event: 'guildMemberAdd',
			category: 'client',
		});
	}

	public async exec(member: GuildMember): Promise<void> {
		const welcomeChannel: string = await db.guildGet('welcomeChannel', member.guild.id, '737460457375268896') as string;
		////console.log(welcomeChannel)
		if (welcomeChannel) {
			const welcome = <TextChannel>this.client.channels.cache.get(welcomeChannel)
			const embed: MessageEmbed = new MessageEmbed()
				.setDescription(`:slight_smile: \`${member.user.tag}\` joined the server. There are now ${welcome.guild.memberCount.toLocaleString()} members.`)
				.setColor('7ed321')
			welcome.send(embed)
		}

		if (member.guild.id == '516977525906341928'){

			const hadRoles = await stickyRoleDataSchema.find({id: member.id})
			////await this.client.userSettings.get(member.id, 'info', undefined)
			////console.log(`${member.user.tag} joined and had these roles previously ${hadRoles}`)
			if (hadRoles && hadRoles.length !=0) {
				try{
					await member.roles.add((hadRoles[0]['roles']), 'Returning member\'s previous roles.');
					////await this.client.userSettings.delete(member.id, 'info')
					////await this.client.userSettings.delete(member.id, 'left')
				} catch(e){
					console.error(e)
				}
			}else{
				try{
					await member.roles.add(['783794633129197589','801976603772321796'], 'Join roles.')
				} catch(e){
					console.error(e)
				}

			}
			
			/**
			 * *Change Channel Name
			 * todo: This doesn't work properly because Discord only lets you change a channel's name every 5 minutes or something.
			 */
			/*const memberCount = <TextChannel>this.client.channels.cache.get('785281831788216364')
			if (memberCount.guild.memberCount.toString().endsWith('0')||memberCount.guild.memberCount.toString().endsWith('5')){
				try{
					console.log('tried to rename')
					await memberCount.setName(`Members: ${memberCount.guild.memberCount}`)
					console.log('renamed')
				}catch(e){
					console.log(e)
				}
			}*/
			/**
			 * *DM on Join
			 * ? Discord please un-quarantine the bot ty.
			 */
			/*try {
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
				return 
			}*/
		}
	}
}
