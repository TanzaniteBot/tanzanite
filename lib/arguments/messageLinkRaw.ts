import { BotArgumentTypeCaster, regex } from '#lib';
import type { Snowflake } from 'discord.js';

// this returns the matched snowflakes of a message link, not the message itself
export const messageLinkRaw: BotArgumentTypeCaster<ParsedMessageLink | null> = (_, phrase) => {
	// make a new regex object since it is global
	const match = new RegExp(regex.messageLink).exec(phrase);
	if (!match || !match.groups) return null;

	const { guild_id, channel_id, message_id } = match.groups;
	if (!guild_id || !channel_id || !message_id) return null;

	return { guild_id, channel_id, message_id };
};

export interface ParsedMessageLink {
	guild_id: Snowflake;
	channel_id: Snowflake;
	message_id: Snowflake;
}
