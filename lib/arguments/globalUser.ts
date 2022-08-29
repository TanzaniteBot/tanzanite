import type { BotArgumentTypeCaster } from '#lib';
import type { User } from 'discord.js';

// resolve non-cached users
export const globalUser: BotArgumentTypeCaster<Promise<User | null>> = async (message, phrase) => {
	return message.client.users.resolve(phrase) ?? (await message.client.users.fetch(`${phrase}`).catch(() => null));
};
