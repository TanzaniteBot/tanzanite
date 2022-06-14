import type { BushArgumentTypeCaster } from '#lib';
import type { User } from 'discord.js';

// resolve non-cached users
export const globalUser: BushArgumentTypeCaster<Promise<User | null>> = async (_, phrase) => {
	return client.users.resolve(phrase) ?? (await client.users.fetch(`${phrase}`).catch(() => null));
};
