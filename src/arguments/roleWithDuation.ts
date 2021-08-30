import { BushArgumentTypeCaster } from '@lib';

export const roleWithDurationTypeCaster: BushArgumentTypeCaster = async (
	message,
	phrase
): Promise<{ duration: number; role: string | null } | null> => {
	// eslint-disable-next-line prefer-const
	let { duration, contentWithoutTime } = client.util.parseDuration(phrase);
	if (contentWithoutTime === null || contentWithoutTime === undefined) return null;
	if (contentWithoutTime[0] === ' ') contentWithoutTime = contentWithoutTime.replace(' ', '');
	const role = await util.arg.cast('role', client.commandHandler.resolver, message, contentWithoutTime);
	if (!role) return null;
	return { duration, role };
};
