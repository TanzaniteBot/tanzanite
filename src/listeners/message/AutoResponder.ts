import { Message, MessageEmbed } from 'discord.js';
import { BushListener } from '../../lib/extensions/BushListener';
import * as botoptions from '../../config/botoptions';
import log from '../../lib/utils/log';

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

export default class AutoResponderListener extends BushListener {
	public constructor() {
		super('AutoResponderListener', {
			emitter: 'client',
			event: 'message',
			category: 'message'
		});
	}

	public async exec(message: Message): Promise<void> {
		async function respond(messageContent: string | MessageEmbed, reply?: boolean): Promise<void> {
			if (reply) {
				await message?.util
					?.reply(messageContent)
					.catch(() => {
						if (message.channel.type === 'dm') {
							return log.warn('AutoResponder', `Could not send message to <<${message.channel.recipient.tag}>>.`);
						}
						return log.warn('AutoResponder', `Could not send message in <<${message.channel?.name}>> in <<${message.guild.name}>>.`);
					})
					.then(() => {
						if (botoptions.info) {
							if (message.channel.type === 'dm') {
								return log.info('AutoResponder', `Sent a message to <<${message.channel.recipient.tag}>>.`);
							}
							return log.info('AutoResponder', `Sent a message in <<${message.channel?.name}>> in <<${message.guild.name}>>.`);
						}
					});
				return;
			} else {
				await message?.channel
					?.send(messageContent)
					.catch(() => {
						if (message.channel.type === 'dm') return log.warn('AutoResponder', `Could not send message to <<${message.channel.recipient.tag}>>.`);
						return log.warn('AutoResponder', `Could not send message in <<${message.channel?.name}>> in <<${message.guild.name}>>.`);
					})
					.then(() => {
						if (botoptions.info) {
							if (message.channel.type === 'dm') return log.info('AutoResponder', `$Sent a message to <<${message.channel.recipient.tag}>>.`);
							log.info('AutoResponder', `Sent a message in <<${message.channel?.name}>> in <<${message.guild.name}>>.`);
						}
					});
			}
		}

		if (!message.guild) return;
		if (message.guild.id == '516977525906341928') {
			if (!message.guild) return;
			if (message.author.bot) return;
			if (message.content.toLowerCase().includes('good bot')) {
				const embed: MessageEmbed = new MessageEmbed().setDescription('Yes, I am a very good bot.').setColor(this.client.consts.Green);
				await respond(embed);
				return;
			}
			if (message.content.toLowerCase().includes('bad bot')) {
				await respond('<:mad:783046135392239626>');
				return;
			}
			if (message.content.startsWith('-neu') || message.content.startsWith('-patch')) {
				await respond('Please download the latest patch from <#693586404256645231>.');
				return;
			}
			if (message.content.includes('io.github.moulberry.notenoughupdates.miscgui.GuiItemRecipe cannot be cast to io.github.moulberry.notenoughupdates.mixins.GuiContainerAccessor')) {
				await respond('Known bug, download pre-release 25.1 or later.');
				return;
			}
			if (updateTriggers.some(t => message.content.toLowerCase().includes(t))) {
				if (message.member?.roles.cache.some(r => exemptRoles.includes(r.id))) {
					return;
				} else {
					if (supportChannels.some(a => message.channel.id.includes(a))) {
						await respond('Please download the latest patch from <#795602083382296616>.', true);
						//TODO: Make this use the db
						message.member.roles.add('802173969821073440', 'One time auto response.').catch(() => {
							log.warn('AutoResponder', `Failed to add role to <<${message.author.tag}>>.`);
						});
						return;
					}
				}
			} else {
				return;
			}
		}
	}
}
