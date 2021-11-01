import { AllowedMentions, BushCommand, type BushMessage } from '#lib';

export default class GiveawayPingCommand extends BushCommand {
	public constructor() {
		super('giveawayPing', {
			aliases: ['giveaway-ping', 'giveaway-pong'],
			category: "Moulberry's Bush",
			description: {
				content: 'Pings the giveaway role.',
				usage: ['giveaway-ping'],
				examples: ['giveaway-ping']
			},
			clientPermissions: (m) => util.clientSendAndPermCheck(m, ['MANAGE_MESSAGES'], true),
			userPermissions: ['MANAGE_GUILD', 'MANAGE_MESSAGES', 'BAN_MEMBERS', 'KICK_MEMBERS', 'VIEW_CHANNEL'],
			channel: 'guild',
			ignoreCooldown: [],
			ignorePermissions: [],
			cooldown: 1.44e7, //4 hours
			ratelimit: 1,
			editable: false,
			restrictedGuilds: ['516977525906341928'],
			restrictedChannels: ['767782084981817344', '833855738501267456']
		});
	}

	public override async exec(message: BushMessage) {
		if (!message.member!.permissions.has('MANAGE_GUILD') && !message.member!.user.isOwner())
			await message.util.reply(`${util.emojis.error} You are missing the **MANAGE_GUILD** permission.`);

		await message.delete().catch(() => {});

		return await message.channel.send({
			content:
				'🎉 <@&767782793261875210> Giveaway.\n\n<:mad:783046135392239626> Spamming, line breaking, gibberish etc. disqualifies you from winning. We can and will ban you from giveaways. Winners will all be checked and rerolled if needed.',
			allowedMentions: AllowedMentions.roles()
		});

		//! Broken
		/* const webhooks = await (message.channel as TextChannel | NewsChannel).fetchWebhooks();
		let webhookClient: WebhookClient;
		if (webhooks.size < 1) {
			const webhook = await (message.channel as TextChannel | NewsChannel).createWebhook('Giveaway ping webhook');
			webhookClient = new WebhookClient(webhook.id, webhook.token);
		} else {
			const webhook = webhooks.first();
			webhookClient = new WebhookClient(webhook.id, webhook.token);
		}
		return await webhookClient.send({
			content:
				'🎉 <@&767782793261875210> Giveaway.\n\n<:mad:783046135392239626> Spamming, line breaking, gibberish etc. disqualifies you from winning. We can and will ban you from giveaways. Winners will all be checked and rerolled if needed.',
			username: `${message.member.nickname || message.author.username}`,
			avatarURL: message.author.avatarURL({ dynamic: true }),
			allowedMentions: AllowedMentions.roles()
		}); */
	}
}
