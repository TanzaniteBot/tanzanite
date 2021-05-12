import { BotCommand } from '../../lib/extensions/BotCommand';
import AllowedMentions from '../../lib/utils/AllowedMentions';
import { Message, WebhookClient } from 'discord.js';
import { TextChannel } from 'discord.js';
import { NewsChannel } from 'discord.js';

export default class GiveawayPingCommand extends BotCommand {
	constructor() {
		super('giveawayping', {
			aliases: ['giveawayping', 'giveawaypong'],
			category: "Moulberry's Bush",
			description: {
				content: 'Pings the giveaway role.',
				usage: 'giveawayping',
				examples: ['giveawayping']
			},
			clientPermissions: ['MANAGE_MESSAGES'],
			userPermissions: [
				'SEND_MESSAGES',
				'MANAGE_GUILD',
				'MANAGE_MESSAGES',
				'BAN_MEMBERS',
				'KICK_MEMBERS',
				'VIEW_CHANNEL'
			],
			channel: 'guild',
			ignoreCooldown: [],
			ignorePermissions: [],
			cooldown: 1.44e7, //4 hours
			ratelimit: 1,
			editable: false
		});
	}
	public async exec(message: Message): Promise<unknown> {
		if (message.guild.id !== '516977525906341928')
			return message.reply(
				"<:error:837123021016924261> This command may only be run in Moulberry's Bush."
			);
		if (
			!['767782084981817344', '833855738501267456'].includes(message.channel.id)
		)
			return message.reply(
				'<:error:837123021016924261> This command may only be run in giveaway channels.'
			);
		await message.delete().catch(() => undefined);
		const webhooks = await (message.channel as
			| TextChannel
			| NewsChannel).fetchWebhooks();
		let webhookClient: WebhookClient;
		if (webhooks.size < 1) {
			const webhook = await (message.channel as
				| TextChannel
				| NewsChannel).createWebhook('Giveaway ping webhook');
			webhookClient = new WebhookClient(webhook.id, webhook.token);
		} else {
			const webhook = webhooks.first();
			webhookClient = new WebhookClient(webhook.id, webhook.token);
		}
		return webhookClient.send(
			'🎉 <@&767782793261875210> Giveaway.\n\n<:mad:783046135392239626> Spamming, line breaking, gibberish etc. disqualifies you from winning. We can and will ban you from giveaways. Winners will all be checked and rerolled if needed.',
			{
				username: `${message.member.nickname || message.author.username}`,
				avatarURL: message.author.avatarURL({ dynamic: true }),
				allowedMentions: AllowedMentions.roles()
			}
		);
	}
}
