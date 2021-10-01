import { BushArgumentTypeCaster, BushUser } from '@lib';

// resolve non-cached users
export const globalUserTypeCaster: BushArgumentTypeCaster = async (_, phrase): Promise<BushUser | null> => {
	return client.users.cache.has(phrase)
		? client.users.cache.get(`${phrase}`) ?? null
		: await client.users.fetch(`${phrase}`).catch(() => null);
};
