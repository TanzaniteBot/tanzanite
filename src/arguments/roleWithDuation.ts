import { BushArgumentTypeCaster } from '@lib';

export const roleWithDurationTypeCaster: BushArgumentTypeCaster = async (
	message,
	phrase
): Promise<{ duration: number; role: string | null } | null> => {
	const { duration, contentWithoutTime } = client.util.parseDuration(phrase);
	if (contentWithoutTime === null || contentWithoutTime === undefined) return null;
	const role = await util.arg.cast('role', client.commandHandler.resolver, message, contentWithoutTime);
	console.debug(['role'], [role], [contentWithoutTime]);
	if (!role) return null;
	return { duration, role };
};
