import { type BushArgumentTypeCaster } from '@lib';

export const roleWithDurationTypeCaster: BushArgumentTypeCaster = async (
	message,
	phrase
): Promise<{ duration: number | null; role: string | null } | null> => {
	// eslint-disable-next-line prefer-const
	let { duration, contentWithoutTime } = client.util.parseDuration(phrase);
	if (contentWithoutTime === null || contentWithoutTime === undefined) return null;
	contentWithoutTime = contentWithoutTime.trim();
	const role = await util.arg.cast('role', message, contentWithoutTime);
	if (!role) return null;
	return { duration, role };
};
