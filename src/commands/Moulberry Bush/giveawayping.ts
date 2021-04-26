import { BushCommand } from '../../lib/extensions/BushCommand';
import AllowedMentions from '../../lib/utils/AllowedMentions';
import { Message, WebhookClient } from 'discord.js';

export default class GiveawayPingCommand extends BushCommand {
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
			userPermissions: ['SEND_MESSAGES', 'MANAGE_GUILD', 'MANAGE_MESSAGES', 'BAN_MEMBERS', 'KICK_MEMBERS', 'VIEW_CHANNEL'],
			channel: 'guild',
			ignoreCooldown: [
				/* '322862723090219008' */
			],
			ignorePermissions: [
				/* '322862723090219008' */
			],
			cooldown: 1.44e7, //4 hours
			ratelimit: 1,
			editable: false
		});
	}
	public async exec(message: Message): Promise<unknown> {
		//if (message.author.id != '322862723090219008') {
		if (message.channel.type === 'dm') return message.util.reply('<:no:787549684196704257> This command cannot be run in DMs.');
		if (message.guild.id !== '516977525906341928') return message.util.reply("<:no:787549684196704257> This command can only be run in Moulberry's Bush.");
		if (message.channel.id !== ('767782084981817344' || '833855738501267456')) {
			return message.util.reply('<:no:787549684196704257> This command can only be run in <#767782084981817344>.');
		}
		if (!message.member.permissions.has('MANAGE_GUILD')) return message.util.reply('<:no:787549684196704257> You are missing the `MANAGE_GUILD` permission.');
		//}

		// eslint-disable-next-line @typescript-eslint/no-empty-function
		await message.delete().catch(() => {});
		const webhookClient = new WebhookClient(this.client.credentials.webhookID, this.client.credentials.webhookToken);
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
