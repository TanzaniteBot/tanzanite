import {
	AllIntegrationTypes,
	AllInteractionContexts,
	BotCommand,
	colors,
	format,
	type CommandMessage,
	type SlashMessage
} from '#lib';
import { EmbedBuilder } from 'discord.js';
import assert from 'node:assert';

export default class PingCommand extends BotCommand {
	public constructor() {
		super('ping', {
			aliases: ['ping'],
			category: 'info',
			description: 'Gets the latency of the bot',
			usage: ['ping'],
			examples: ['ping'],
			slash: true,
			clientPermissions: ['EmbedLinks'],
			clientCheckChannel: true,
			userPermissions: [],
			slashContexts: AllInteractionContexts,
			slashIntegrationTypes: AllIntegrationTypes
		});
	}

	public override async exec(message: CommandMessage) {
		const timestamp1 = message.editedTimestamp ?? message.createdTimestamp;
		const msg = await message.util.reply('Pong!');
		const timestamp2 = msg.editedTimestamp ?? msg.createdTimestamp;
		void this.command(message, timestamp2 - timestamp1);
	}

	public override async execSlash(message: SlashMessage) {
		const timestamp1 = message.createdTimestamp;
		const { resource } = await message.interaction.reply({ content: 'Pong!', withResponse: true });
		assert(resource !== null);
		const { message: msg } = resource;
		assert(msg !== null);

		const timestamp2 = msg.editedTimestamp ?? msg.createdTimestamp;
		void this.command(message, timestamp2 - timestamp1);
	}

	private command(message: CommandMessage | SlashMessage, msgLatency: number) {
		const botLatency = format.codeBlock(`${Math.round(msgLatency)}ms`);
		const apiLatency = format.codeBlock(message.client.ping != null ? `${Math.round(message.client.ping)}ms` : 'unknown');
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
			content: '',
			embeds: [embed]
		});
	}
}
