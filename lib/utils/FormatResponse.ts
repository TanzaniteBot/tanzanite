import { unbanResponse, type UnbanResponse } from '#lib/extensions/discord.js/ExtendedGuild.js';
import {
	AddRoleResponse,
	banResponse,
	blockResponse,
	kickResponse,
	muteResponse,
	removeTimeoutResponse,
	roleResponse,
	timeoutResponse,
	unblockResponse,
	unmuteResponse,
	warnResponse,
	WarnResponse,
	type BanResponse,
	type BlockResponse,
	type KickResponse,
	type MuteResponse,
	type TimeoutResponse,
	type UnblockResponse,
	type UnmuteResponse
} from '#lib/extensions/discord.js/ExtendedGuildMember.js';
import type { Client, GuildMember, Snowflake, User } from 'discord.js';
import { emojis } from './Constants.js';
import { input } from './Format.js';
import { format, humanizeDuration, ordinal } from './Utils.js';

export async function formatBanResponseId(client: Client, userId: Snowflake, code: BanResponse) {
	const user =
		(await client.utils.resolveNonCachedUser(userId)) ??
		({
			get tag() {
				return userId;
			}
		} as User);

	return formatBanResponse(user, code);
}

export function formatBanResponse(user: User, code: BanResponse): string {
	const victim = format.input(user.tag);
	switch (code) {
		case banResponse.AlreadyBanned:
			return `${emojis.error} ${victim} is already banned.`;
		case banResponse.MissingPermissions:
			return `${emojis.error} Could not ban ${victim} because I am missing the **Ban Members** permission.`;
		case banResponse.ActionError:
			return `${emojis.error} An error occurred while trying to ban ${victim}.`;
		case banResponse.PunishmentEntryError:
			return `${emojis.error} While banning ${victim}, there was an error creating a ban entry, please report this to my developers.`;
		case banResponse.ModlogError:
			return `${emojis.error} While banning ${victim}, there was an error creating a modlog entry, please report this to my developers.`;
		case banResponse.DmError:
			return `${emojis.warn} Banned ${victim} however I could not send them a dm.`;
		case banResponse.Success:
			return `${emojis.success} Successfully banned ${victim}.`;
		default:
			return `${emojis.error} An error occurred: ${format.input(code)}}`;
	}
}

export function formatUnbanResponse(user: User, code: UnbanResponse): string {
	const victim = format.input(user.tag);
	switch (code) {
		case unbanResponse.MissingPermissions:
			return `${emojis.error} Could not unban ${victim} because I am missing the **Ban Members** permission.`;
		case unbanResponse.ActionError:
			return `${emojis.error} An error occurred while trying to unban ${victim}.`;
		case unbanResponse.PunishmentEntryError:
			return `${emojis.error} While unbanning ${victim}, there was an error removing their ban entry, please report this to my developers.`;
		case unbanResponse.ModlogError:
			return `${emojis.error} While unbanning ${victim}, there was an error creating a modlog entry, please report this to my developers.`;
		case unbanResponse.NotBanned:
			return `${emojis.warn} ${victim} is not banned but I tried to unban them anyways.`;
		case unbanResponse.DmError:
		case unbanResponse.Success:
			return `${emojis.success} Successfully unbanned ${victim}.`;
		default:
			return `${emojis.error} An error occurred: ${format.input(code)}}`;
	}
}

export function formatBlockResponse(member: GuildMember, code: BlockResponse): string {
	const victim = format.input(member.user.tag);
	switch (code) {
		case blockResponse.MissingPermissions:
			return `${emojis.error} Could not block ${victim} because I am missing the **Manage Channel** permission.`;
		case blockResponse.InvalidChannel:
			return `${emojis.error} Could not block ${victim}, you can only block users in text or thread channels.`;
		case blockResponse.ActionError:
			return `${emojis.error} An unknown error occurred while trying to block ${victim}.`;
		case blockResponse.ModlogError:
			return `${emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
		case blockResponse.PunishmentEntryError:
			return `${emojis.error} There was an error creating a punishment entry, please report this to my developers.`;
		case blockResponse.DmError:
			return `${emojis.warn} Blocked ${victim} however I could not send them a dm.`;
		case blockResponse.Success:
			return `${emojis.success} Successfully blocked ${victim}.`;
		default:
			return `${emojis.error} An error occurred: ${format.input(code)}}`;
	}
}

export function formatUnblockResponse(member: GuildMember, code: UnblockResponse): string {
	const victim = format.input(member.user.tag);
	switch (code) {
		case unblockResponse.MissingPermissions:
			return `${emojis.error} Could not unblock ${victim} because I am missing the **Manage Channel** permission.`;
		case unblockResponse.InvalidChannel:
			return `${emojis.error} Could not unblock ${victim}, you can only unblock users in text or thread channels.`;
		case unblockResponse.ActionError:
			return `${emojis.error} An unknown error occurred while trying to unblock ${victim}.`;
		case unblockResponse.ModlogError:
			return `${emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
		case unblockResponse.PunishmentEntryError:
			return `${emojis.error} There was an error creating a punishment entry, please report this to my developers.`;
		case unblockResponse.DmError:
			return `${emojis.warn} Unblocked ${victim} however I could not send them a dm.`;
		case unblockResponse.Success:
			return `${emojis.success} Successfully unblocked ${victim}.`;
		default:
			return `${emojis.error} An error occurred: ${format.input(code)}}`;
	}
}

export function formatMuteResponse(prefix: string, member: GuildMember, code: MuteResponse): string {
	const victim = format.input(member.user.tag);
	switch (code) {
		case muteResponse.MissingPermissions:
			return `${emojis.error} Could not mute ${victim} because I am missing the **Manage Roles** permission.`;
		case muteResponse.NoMuteRole:
			return `${emojis.error} Could not mute ${victim}, you must set a mute role with \`${prefix}config muteRole\`.`;
		case muteResponse.MuteRoleInvalid:
			return `${emojis.error} Could not mute ${victim} because the current mute role no longer exists. Please set a new mute role with \`${prefix}config muteRole\`.`;
		case muteResponse.MuteRoleNotManageable:
			return `${emojis.error} Could not mute ${victim} because I cannot assign the current mute role, either change the role's position or set a new mute role with \`${prefix}config muteRole\`.`;
		case muteResponse.ActionError:
			return `${emojis.error} Could not mute ${victim}, there was an error assigning them the mute role.`;
		case muteResponse.ModlogError:
			return `${emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
		case muteResponse.PunishmentEntryError:
			return `${emojis.error} There was an error creating a punishment entry, please report this to my developers.`;
		case muteResponse.DmError:
			return `${emojis.warn} Muted ${victim} however I could not send them a dm.`;
		case muteResponse.Success:
			return `${emojis.success} Successfully muted ${victim}.`;
		default:
			return `${emojis.error} An error occurred: ${format.input(code)}}`;
	}
}

export function formatUnmuteResponse(prefix: string, member: GuildMember, code: UnmuteResponse): string {
	const error = emojis.error;
	const victim = input(member.user.tag);
	switch (code) {
		case unmuteResponse.MissingPermissions:
			return `${error} Could not unmute ${victim} because I am missing the **Manage Roles** permission.`;
		case unmuteResponse.NoMuteRole:
			return `${error} Could not unmute ${victim}, you must set a mute role with \`${prefix}config muteRole\`.`;
		case unmuteResponse.MuteRoleInvalid:
			return `${error} Could not unmute ${victim} because the current mute role no longer exists. Please set a new mute role with \`${prefix}config muteRole\`.`;
		case unmuteResponse.MuteRoleNotManageable:
			return `${error} Could not unmute ${victim} because I cannot assign the current mute role, either change the role's position or set a new mute role with \`${prefix}config muteRole\`.`;
		case unmuteResponse.ActionError:
			return `${error} Could not unmute ${victim}, there was an error removing their mute role.`;
		case unmuteResponse.ModlogError:
			return `${error} While muting ${victim}, there was an error creating a modlog entry, please report this to my developers.`;
		case unmuteResponse.PunishmentEntryError:
			return `${error} While muting ${victim}, there was an error removing their mute entry, please report this to my developers.`;
		case unmuteResponse.DmError:
			return `${emojis.warn} unmuted ${victim} however I could not send them a dm.`;
		case unmuteResponse.Success:
			return `${emojis.success} Successfully unmuted ${victim}.`;
		default:
			return `${emojis.error} An error occurred: ${format.input(code)}}`;
	}
}

export function formatTimeoutResponse(member: GuildMember, code: TimeoutResponse): string {
	const victim = format.input(member.user.tag);
	switch (code) {
		case timeoutResponse.MissingPermissions:
			return `${emojis.error} Could not timeout ${victim} because I am missing the **Timeout Members** permission.`;
		case timeoutResponse.InvalidDuration:
			return `${emojis.error} The duration you specified is too long, the longest you can timeout someone for is 28 days.`;
		case timeoutResponse.ActionError:
			return `${emojis.error} An unknown error occurred while trying to timeout ${victim}.`;
		case timeoutResponse.ModlogError:
			return `${emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
		case timeoutResponse.DmError:
			return `${emojis.warn} Timed out ${victim} however I could not send them a dm.`;
		case timeoutResponse.Success:
			return `${emojis.success} Successfully timed out ${victim}.`;
		default:
			return `${emojis.error} An error occurred: ${format.input(code)}}`;
	}
}

export function formatUntimeoutResponse(member: GuildMember, code: TimeoutResponse): string {
	const victim = format.input(member.user.tag);
	switch (code) {
		case removeTimeoutResponse.MissingPermissions:
			return `${emojis.error} Could not untimeout ${victim} because I am missing the **Timeout Members** permission.`;
		case removeTimeoutResponse.ActionError:
			return `${emojis.error} An unknown error occurred while trying to timeout ${victim}.`;
		case removeTimeoutResponse.ModlogError:
			return `${emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
		case removeTimeoutResponse.DmError:
			return `${emojis.warn} Removed ${victim}'s timeout however I could not send them a dm.`;
		case removeTimeoutResponse.Success:
			return `${emojis.success} Successfully removed ${victim}'s timeout.`;
		default:
			return `${emojis.error} An error occurred: ${format.input(code)}}`;
	}
}

export function formatKickResponse(member: GuildMember, code: KickResponse): string {
	const victim = format.input(member.user.tag);
	switch (code) {
		case kickResponse.MissingPermissions:
			return `${emojis.error} Could not kick ${victim} because I am missing the **Kick Members** permission.`;
		case kickResponse.ActionError:
			return `${emojis.error} An error occurred while trying to kick ${victim}.`;
		case kickResponse.ModlogError:
			return `${emojis.error} While muting ${victim}, there was an error creating a modlog entry, please report this to my developers.`;
		case kickResponse.DmError:
			return `${emojis.warn} Kicked ${victim} however I could not send them a dm.`;
		case kickResponse.Success:
			return `${emojis.success} Successfully kicked ${victim}.`;
		default:
			return `${emojis.error} An error occurred: ${format.input(code)}}`;
	}
}

export function formatWarnResponse(caseNum: number | null, member: GuildMember, code: WarnResponse): string {
	const victim = format.input(member.user.tag);
	switch (code) {
		case warnResponse.ModlogError:
			return `${emojis.error} While warning ${victim}, there was an error creating a modlog entry, please report this to my developers.`;
		case warnResponse.ActionError:
		case warnResponse.DmError:
			return `${emojis.warn} ${victim} has been warned for the ${ordinal(
				caseNum ?? 0
			)} time, however I could not send them a dm.`;
		case warnResponse.Success:
			return `${emojis.success} Successfully warned ${victim} for the ${ordinal(caseNum ?? 0)} time.`;
		default:
			return `${emojis.error} An error occurred: ${format.input(code)}}`;
	}
}

export function formatRoleResponse(
	roleId: Snowflake,
	action: 'add' | 'remove',
	duration: number | null,
	member: GuildMember,
	code: AddRoleResponse
): string {
	const victim = format.input(member.user.tag);
	switch (code) {
		case roleResponse.MissingPermissions:
			return `${emojis.error} I don't have the **Manage Roles** permission.`;
		case roleResponse.UserHierarchy:
			return `${emojis.error} <@&${roleId}> is higher or equal to your highest role.`;
		case roleResponse.RoleManaged:
			return `${emojis.error} <@&${roleId}> is managed by an integration and cannot be managed.`;
		case roleResponse.ClientHierarchy:
			return `${emojis.error} <@&${roleId}> is higher or equal to my highest role.`;
		case roleResponse.ModlogError:
			return `${emojis.error} There was an error creating a modlog entry, please report this to my developers.`;
		case roleResponse.PunishmentEntryError:
			return `${emojis.error} There was an error ${
				action === 'add' ? 'creating' : 'removing'
			} a punishment entry, please report this to my developers.`;
		case roleResponse.ActionError:
			return `${emojis.error} An error occurred while trying to ${action} <@&${roleId}> ${
				action === 'add' ? 'to' : 'from'
			} ${victim}.`;
		case roleResponse.Success:
			return `${emojis.success} Successfully ${action === 'add' ? 'added' : 'removed'} <@&${roleId}> ${
				action === 'add' ? 'to' : 'from'
			} ${victim}${duration ? ` for ${humanizeDuration(duration)}` : ''}.`;
		default:
			return `${emojis.error} An error occurred: ${format.input(code)}}`;
	}
}
