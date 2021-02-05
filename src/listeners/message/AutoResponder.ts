import { Message    , MessageEmbed, TextChannel } from 'discord.js'                  ;
import { BotListener                            } from '../../extensions/BotListener';

const updateTriggers = [
	'broken',
	'not work',
	'neu',
	'not recogniz',
	'patch',
	'mod'
]

export default class AutoResponderListener extends BotListener {
	public constructor() {
		super('AutoResponderListener', {
			emitter: 'client',
			event: 'message',
			category: 'message',
		});
	}

	public async exec(message: Message): Promise<void> {
		if(!message.guild) return
		if (message.guild.id == '516977525906341928'){
			if(message.content.toLowerCase().includes('good bot')){
				const embed: MessageEmbed = new MessageEmbed()
					.setDescription('Yes, I am a very good bot.')
					.setColor(this.client.consts.Green)
				message.channel.send(embed)
				return;
			}
			if(message.content.toLowerCase().includes('bad bot')){
				message.channel.send('<:mad:783046135392239626>')
				return;
			}
			const exemptRoles = [
				'782803470205190164', //Sr. Mod
				'737308259823910992', //Mod
				'746541309853958186', //admin perms
				'742165914148929536', //moul
				'737440116230062091', //helper
				'802173969821073440' //no auto respond
			]
			if (message.content.startsWith('-neu')
			||message.content.startsWith('-patch')
			){
				await message.channel.send('Please download the latest patch from <#795602083382296616>.'); //pre-releases 
				return
			}
			if (!message.guild) return;
			if (message.author.bot) return;
			if (updateTriggers.some(t => message.content.toLowerCase().includes(t))) {
				if(message.member?.roles.cache.some(r => exemptRoles.includes(r.id))){
					return
				}else{
					await message.reply('Please download the latest patch from <#795602083382296616>.'); //pre-releases 
					try{
						message.member.roles.add('802173969821073440', 'One time auto response.')
					}catch(e){
						console.log(e)
					}
					return
				}
			} else if(message.content.toLowerCase().includes('sba')){
				if(!message.member?.roles.cache.some(r => exemptRoles.includes(r.id))){
					await message.reply('Please download sba\'s latest patch from <#783869135086944306>.');
					try{
						message.member.roles.add('802173969821073440', 'One time auto response.')
					}catch(e){
						console.log(e)
					}
					return
				}
			}else{
				return;
			}
		}
	}
}
