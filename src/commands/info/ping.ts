import { BotCommand, clientSendAndPermCheck, colors, format, type CommandMessage, type SlashMessage } from '#lib';
import { EmbedBuilder, PermissionFlagsBits, type Message } from 'discord.js';

export default class PingCommand extends BotCommand {
	public constructor() {
		super('ping', {
			aliases: ['ping'],
			category: 'info',
			description: 'Gets the latency of the bot',
			usage: ['ping'],
			examples: ['ping'],
			slash: true,
			clientPermissions: (m) => clientSendAndPermCheck(m, [PermissionFlagsBits.EmbedLinks], true),
			userPermissions: []
		});
	}

	public override async exec(message: CommandMessage) {
		const timestamp1 = message.editedTimestamp ? message.editedTimestamp : message.createdTimestamp;
		const msg = await message.util.reply('Pong!');
		const timestamp2 = msg.editedTimestamp ? msg.editedTimestamp : msg.createdTimestamp;
		void this.command(message, timestamp2 - timestamp1);
	}

	public override async execSlash(message: SlashMessage) {
		const timestamp1 = message.createdTimestamp;
		const msg = (await message.util.reply({ content: 'Pong!', fetchReply: true })) as Message;
		const timestamp2 = msg.editedTimestamp ? msg.editedTimestamp : msg.createdTimestamp;
		void this.command(message, timestamp2 - timestamp1);
	}

	private command(message: CommandMessage | SlashMessage, msgLatency: number) {
		const botLatency = format.codeBlock(`${Math.round(msgLatency)}ms`);
		const apiLatency = format.codeBlock(`${Math.round(message.client.ws.ping)}ms`);
		const embed = new EmbedBuilder()
			.setTitle('Pong!  🏓')
			.addFields(
				{ name: 'Bot Latency', value: botLatency, inline: true },
				{ name: 'API Latency', value: apiLatency, inline: true }
			)
			.setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
			.setColor(colors.default)
			.setTimestamp();
		return message.util.reply({
			content: null,
			embeds: [embed]
		});
	}
}
