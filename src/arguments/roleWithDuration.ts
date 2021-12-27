import { type BushArgumentTypeCaster } from '#lib';
import { Role } from 'discord.js';

export const roleWithDuration: BushArgumentTypeCaster<Promise<RoleWithDuration | null>> = async (message, phrase) => {
	// eslint-disable-next-line prefer-const
	let { duration, contentWithoutTime } = client.util.parseDuration(phrase);
	if (contentWithoutTime === null || contentWithoutTime === undefined) return null;
	contentWithoutTime = contentWithoutTime.trim();
	const role = await util.arg.cast('role', message, contentWithoutTime);
	if (!role) return null;
	return { duration, role };
};

export interface RoleWithDuration {
	duration: number | null;
	role: Role | null;
}
