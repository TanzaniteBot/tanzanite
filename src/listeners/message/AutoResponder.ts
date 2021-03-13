import { Message, MessageEmbed, TextChannel } from 'discord.js';
import { BotListener } from '../../extensions/BotListener';

const updateTriggers = ['broken', 'not work', 'neu', 'not recogniz', 'patch', 'mod', 'titanium'],
	exemptRoles = [
		'742165914148929536', //Moulberry
		'746541309853958186', //AdminPerms
		'782803470205190164', //Sr. Moderator
		'737308259823910992', //Moderator
		'737440116230062091', //Helper
		'783537091946479636', //Trial Helper
		'802173969821073440' //No Autorespond
	],
	supportChannels = [
		'714332750156660756', //neu-support-1
		'737414807250272258' //neu-support-2
	];

export default class AutoResponderListener extends BotListener {
	public constructor() {
		super('AutoResponderListener', {
			emitter: 'client',
			event: 'message',
			category: 'message'
		});
	}

	public async exec(message: Message): Promise<void> {
		if (!message.guild) return;
		if (message.guild.id == '516977525906341928') {
			if (!message.guild) return;
			if (message.author.bot) return;
			if (message.content.toLowerCase().includes('good bot')) {
				const embed: MessageEmbed = new MessageEmbed().setDescription('Yes, I am a very good bot.').setColor(this.client.consts.Green);
				message.channel.send(embed).catch(() => {
					console.warn('[AutoResponder] Could not send message.');
				});
				return;
			}
			if (message.content.toLowerCase().includes('bad bot')) {
				message.channel.send('<:mad:783046135392239626>').catch(() => {
					console.warn('[AutoResponder] Could not send message.');
				});
				return;
			}
			if (message.content.startsWith('-neu') || message.content.startsWith('-patch')) {
				await message.channel
					.send('Please download the latest patch from <#795602083382296616>.') //pre-releases
					.catch(() => {
						console.warn('[AutoResponder] Could not send message.');
					});
				return;
			}
			/*if (message.content.toLowerCase().includes('give') && message.content.toLowerCase().includes('coin')){
				await message.util.reply('Begging is cringe!')
			}*/
			if (updateTriggers.some((t) => message.content.toLowerCase().includes(t))) {
				if (message.member?.roles.cache.some((r) => exemptRoles.includes(r.id))) {
					return;
				} else {
					if (supportChannels.some((a) => message.channel.id.includes(a))) {
						await message.util
							?.reply('Please download the latest patch from <#795602083382296616>.') //pre-releases
							.catch(() => {
								console.warn('[AutoResponder] Could not send message.');
							});
						message.member.roles.add('802173969821073440', 'One time auto response.').catch(() => {
							console.warn(`[AutoResponder] Failed to add role to ${message.author.tag}.`);
						});
						return;
					}
				}
			} /*else if(message.content.toLowerCase().includes('sba')){
				if(!message.member?.roles.cache.some(r => exemptRoles.includes(r.id))){
					await message.util.reply('Please download sba\'s latest patch from <#783869135086944306>.');
					try{
						message.member.roles.add('802173969821073440', 'One time auto response.')
					}catch(e){
						console.log(e)
					}
					return
				}
			}*/ else {
				return;
			}
		}
	}
}
