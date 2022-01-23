import { BushCommand, type BushMessage, type BushSlashMessage } from '#lib';
import { MessageEmbed, Permissions, type Message } from 'discord.js';

export default class PingCommand extends BushCommand {
	public constructor() {
		super('ping', {
			aliases: ['ping'],
			category: 'info',
			description: 'Gets the latency of the bot',
			usage: ['ping'],
			examples: ['ping'],
			slash: true,
			clientPermissions: (m) => util.clientSendAndPermCheck(m, [Permissions.FLAGS.EMBED_LINKS], true),
			userPermissions: []
		});
	}

	public override async exec(message: BushMessage) {
		const sentMessage = (await message.util.send('Pong!')) as Message;
		const timestamp: number = message.editedTimestamp ? message.editedTimestamp : message.createdTimestamp;
		const botLatency = `${'```'}\n ${Math.round(sentMessage.createdTimestamp - timestamp)}ms ${'```'}`;
		const apiLatency = `${'```'}\n ${Math.round(message.client.ws.ping)}ms ${'```'}`;
		const embed = new MessageEmbed()
			.setTitle('Pong!  🏓')
			.addField('Bot Latency', botLatency, true)
			.addField('API Latency', apiLatency, true)
			.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
			.setColor(util.colors.default)
			.setTimestamp();
		await sentMessage.edit({
			content: null,
			embeds: [embed]
		});
	}

	public override async execSlash(message: BushSlashMessage) {
		const timestamp1 = message.interaction.createdTimestamp;
		await message.interaction.reply('Pong!');
		const timestamp2 = await message.interaction.fetchReply().then((m) => (m as Message).createdTimestamp);
		const botLatency = `${'```'}\n ${Math.round(timestamp2 - timestamp1)}ms ${'```'}`;
		const apiLatency = `${'```'}\n ${Math.round(client.ws.ping)}ms ${'```'}`;
		const embed = new MessageEmbed()
			.setTitle('Pong!  🏓')
			.addField('Bot Latency', botLatency, true)
			.addField('API Latency', apiLatency, true)
			.setFooter({
				text: message.interaction.user.username,
				iconURL: message.interaction.user.displayAvatarURL()
			})
			.setColor(util.colors.default)
			.setTimestamp();
		await message.interaction.editReply({
			content: null,
			embeds: [embed]
		});
	}
}
