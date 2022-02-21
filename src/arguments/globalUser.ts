import { type BushArgumentTypeCaster, type BushUser } from '#lib';

// resolve non-cached users
export const globalUser: BushArgumentTypeCaster<Promise<BushUser | null>> = async (_, phrase) => {
	return client.users.resolve(phrase) ?? (await client.users.fetch(`${phrase}`).catch(() => null));
};
