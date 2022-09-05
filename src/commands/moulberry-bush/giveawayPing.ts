import { AllowedMentions, BotCommand, emojis, mappings, type CommandMessage } from '#lib';
import assert from 'assert/strict';
import { PermissionFlagsBits } from 'discord.js';

export default class GiveawayPingCommand extends BotCommand {
	public constructor() {
		super('giveawayPing', {
			aliases: ['giveaway-ping', 'giveaway-pong'],
			category: "Moulberry's Bush",
			description: 'Pings the giveaway role.',
			usage: ['giveaway-ping'],
			examples: ['giveaway-ping'],
			clientPermissions: ['ManageMessages'],
			clientCheckChannel: true,
			userPermissions: ['ManageGuild', 'ManageMessages', 'BanMembers', 'KickMembers', 'ViewChannel'],
			channel: 'guild',
			ignoreCooldown: [],
			ignorePermissions: [],
			cooldown: 1.44e7, //4 hours
			ratelimit: 1,
			editable: false,
			restrictedGuilds: [mappings.guilds["Moulberry's Bush"]],
			restrictedChannels: [mappings.channels['giveaways']]
		});
	}

	public override async exec(message: CommandMessage) {
		assert(message.inGuild());

		if (!message.member!.permissions.has(PermissionFlagsBits.ManageGuild) && !message.member!.user.isOwner())
			await message.util.reply(`${emojis.error} You are missing the **ManageGuild** permission.`);

		await message.delete().catch(() => {});

		return await message.channel.send({
			content:
				'🎉 <@&767782793261875210> Giveaway.\n\n<:mad:783046135392239626> Spamming, line breaking, gibberish etc. disqualifies you from winning. We can and will ban you from giveaways. Winners will all be checked and rerolled if needed.',
			allowedMentions: AllowedMentions.roles()
		});

		//! Broken
		// const webhooks = await message.channel.fetchWebhooks();
		// let webhookClient: WebhookClient;
		// if (webhooks.size < 1) {
		// 	const webhook = await message.channel.createWebhook('Giveaway ping webhook');
		// 	webhookClient = new WebhookClient(webhook.id, webhook.token);
		// } else {
		// 	const webhook = webhooks.first();
		// 	webhookClient = new WebhookClient(webhook.id, webhook.token);
		// }
		// return await webhookClient.send({
		// 	content:
		// 		'🎉 <@&767782793261875210> Giveaway.\n\n<:mad:783046135392239626> Spamming, line breaking, gibberish etc. disqualifies you from winning. We can and will ban you from giveaways. Winners will all be checked and rerolled if needed.',
		// 	username: `${message.member?.nickname ?? message.author.username}`,
		// 	avatarURL: message.author.avatarURL(),
		// 	allowedMentions: AllowedMentions.roles()
		// });
	}
}
