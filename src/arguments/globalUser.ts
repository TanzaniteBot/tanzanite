import { BushUser, type BushArgumentTypeCaster } from '#lib';

// resolve non-cached users
export const globalUser: BushArgumentTypeCaster<Promise<BushUser | null>> = async (_, phrase) => {
	return client.users.cache.has(phrase)
		? client.users.cache.get(`${phrase}`) ?? null
		: await client.users.fetch(`${phrase}`).catch(() => null);
};
