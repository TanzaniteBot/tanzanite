import type { GuildMember } from 'discord.js';
import { unmuteResponse, UnmuteResponse } from '../extensions/discord.js/ExtendedGuildMember.js';
import { emojis } from './Constants.js';
import { input } from './Format.js';
import { format } from './Utils.js';

export function formatUnmuteResponse(prefix: string, member: GuildMember, code: UnmuteResponse): string {
	const error = emojis.error;
	const victim = input(member.user.tag);
	switch (code) {
		case unmuteResponse.MISSING_PERMISSIONS:
			return `${error} Could not unmute ${victim} because I am missing the **Manage Roles** permission.`;
		case unmuteResponse.NO_MUTE_ROLE:
			return `${error} Could not unmute ${victim}, you must set a mute role with \`${prefix}config muteRole\`.`;
		case unmuteResponse.MUTE_ROLE_INVALID:
			return `${error} Could not unmute ${victim} because the current mute role no longer exists. Please set a new mute role with \`${prefix}config muteRole\`.`;
		case unmuteResponse.MUTE_ROLE_NOT_MANAGEABLE:
			return `${error} Could not unmute ${victim} because I cannot assign the current mute role, either change the role's position or set a new mute role with \`${prefix}config muteRole\`.`;
		case unmuteResponse.ACTION_ERROR:
			return `${error} Could not unmute ${victim}, there was an error removing their mute role.`;
		case unmuteResponse.MODLOG_ERROR:
			return `${error} While muting ${victim}, there was an error creating a modlog entry, please report this to my developers.`;
		case unmuteResponse.PUNISHMENT_ENTRY_REMOVE_ERROR:
			return `${error} While muting ${victim}, there was an error removing their mute entry, please report this to my developers.`;
		case unmuteResponse.DM_ERROR:
			return `${emojis.warn} unmuted ${victim} however I could not send them a dm.`;
		case unmuteResponse.SUCCESS:
			return `${emojis.success} Successfully unmuted ${victim}.`;
		default:
			return `${emojis.error} An error occurred: ${format.input(code)}}`;
	}
}
