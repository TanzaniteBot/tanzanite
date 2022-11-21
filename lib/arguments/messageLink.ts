import { BotArgumentTypeCaster, regex } from '#lib';
import type { Message } from 'discord.js';

export const messageLink: BotArgumentTypeCaster<Promise<Message | null>> = async (message, phrase) => {
	// make a new regex object since it is global
	const match = new RegExp(regex.messageLink).exec(phrase);
	if (!match || !match.groups) return null;

	const { guild_id, channel_id, message_id } = match.groups;
	if (!guild_id || !channel_id || !message_id) return null;

	const guild = message.client.guilds.cache.get(guild_id);
	if (!guild) return null;

	const channel = guild.channels.cache.get(channel_id);
	if (!channel || (!channel.isTextBased() && !channel.isThread())) return null;

	const msg = await channel.messages.fetch(message_id).catch(() => null);
	return msg;
};
