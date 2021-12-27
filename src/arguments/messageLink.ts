import { Message } from 'discord.js';
import { type BushArgumentTypeCaster } from '../lib';

export const messageLink: BushArgumentTypeCaster<Promise<Message | null>> = async (_, phrase) => {
	const match = client.consts.regex.messageLink.exec(phrase);
	if (!match || !match.groups) return null;

	const { guild_id, channel_id, message_id } = match.groups;

	if (!guild_id || !channel_id || message_id) return null;

	const guild = client.guilds.cache.get(guild_id);
	if (!guild) return null;

	const channel = guild.channels.cache.get(channel_id);
	if (!channel || (!channel.isText() && !channel.isThread())) return null;

	const message = await channel.messages.fetch(message_id).catch(() => null);
	return message;
};
