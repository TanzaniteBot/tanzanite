/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	ChannelType,
	GuildMember,
	PermissionFlagsBits,
	type GuildChannelResolvable,
	type GuildTextBasedChannel,
	type Role
} from 'discord.js';
import {
	checkMutePermissions,
	createModLogEntry,
	createPunishmentEntry,
	punishDM,
	PunishmentTypeDM,
	removePunishmentEntry
} from '../../common/Moderation.js';
import { ModLogType } from '../../models/index.js';
import { TanzaniteEvent, Time } from '../../utils/Constants.js';
import { formatError, ValueOf } from '../../utils/Utils.js';
import { TanzaniteClient } from '../discord-akairo/TanzaniteClient.js';
/* eslint-enable @typescript-eslint/no-unused-vars */

interface Extension {
	/**
	 * Send a punishment dm to the user.
	 * @param punishment The punishment that the user has received.
	 * @param reason The reason for the user's punishment.
	 * @param duration The duration of the punishment.
	 * @param modlog The modlog case id so the user can make an appeal.
	 * @param sendFooter Whether or not to send the guild's punishment footer with the dm.
	 * @returns Whether or not the dm was sent successfully.
	 */
	customPunishDM(
		punishment: PunishmentTypeDM,
		reason?: string | null,
		duration?: number,
		modlog?: string,
		sendFooter?: boolean
	): Promise<boolean>;
	/**
	 * Warn the user, create a modlog entry, and send a dm to the user.
	 * @param options Options for warning the user.
	 * @returns An object with the result of the warning, and the case number of the warn.
	 * @emits {@link BotClientEvents.warnMember}
	 */
	customWarn(options: CustomPunishmentOptions): Promise<{ result: WarnResponse; caseNum: number | null }>;
	/**
	 * Add a role to the user, if it is a punishment create a modlog entry, and create a punishment entry if it is temporary or a punishment.
	 * @param options Options for adding a role to the user.
	 * @returns A status message for adding the add.
	 * @emits {@link BotClientEvents.punishRole}
	 */
	customAddRole(options: AddRoleOptions): Promise<AddRoleResponse>;
	/**
	 * Remove a role from the user, if it is a punishment create a modlog entry, and destroy a punishment entry if it was temporary or a punishment.
	 * @param options Options for removing a role from the user.
	 * @returns A status message for removing the role.
	 * @emits {@link BotClientEvents.punishRoleRemove}
	 */
	customRemoveRole(options: RemoveRoleOptions): Promise<RemoveRoleResponse>;
	/**
	 * Mute the user, create a modlog entry, creates a punishment entry, and dms the user.
	 * @param options Options for muting the user.
	 * @returns A status message for muting the user.
	 * @emits {@link BotClientEvents.customMute}
	 */
	customMute(options: CustomTimedPunishmentOptions): Promise<MuteResponse>;
	/**
	 * Unmute the user, create a modlog entry, remove the punishment entry, and dm the user.
	 * @param options Options for unmuting the user.
	 * @returns A status message for unmuting the user.
	 * @emits {@link BotClientEvents.customUnmute}
	 */
	customUnmute(options: CustomPunishmentOptions): Promise<UnmuteResponse>;
	/**
	 * Kick the user, create a modlog entry, and dm the user.
	 * @param options Options for kicking the user.
	 * @returns A status message for kicking the user.
	 * @emits {@link BotClientEvents.customKick}
	 */
	customKick(options: CustomPunishmentOptions): Promise<KickResponse>;
	/**
	 * Ban the user, create a modlog entry, create a punishment entry, and dm the user.
	 * @param options Options for banning the user.
	 * @returns A status message for banning the user.
	 * @emits {@link BotClientEvents.customBan}
	 */
	customBan(options: CustomBanOptions): Promise<Exclude<BanResponse, typeof banResponse['ALREADY_BANNED']>>;
	/**
	 * Prevents a user from speaking in a channel.
	 * @param options Options for blocking the user.
	 */
	customBlock(options: BlockOptions): Promise<BlockResponse>;
	/**
	 * Allows a user to speak in a channel.
	 * @param options Options for unblocking the user.
	 */
	customUnblock(options: UnblockOptions): Promise<UnblockResponse>;
	/**
	 * Mutes a user using discord's timeout feature.
	 * @param options Options for timing out the user.
	 */
	customTimeout(options: CustomTimeoutOptions): Promise<TimeoutResponse>;
	/**
	 * Removes a timeout from a user.
	 * @param options Options for removing the timeout.
	 */
	customRemoveTimeout(options: CustomPunishmentOptions): Promise<RemoveTimeoutResponse>;
	/**
	 * Whether or not the user is an owner of the bot.
	 */
	isOwner(): boolean;
	/**
	 * Whether or not the user is a super user of the bot.
	 */
	isSuperUser(): boolean;
}

declare module 'discord.js' {
	export interface GuildMember extends Extension {
		readonly client: TanzaniteClient;
	}
}

export class ExtendedGuildMember extends GuildMember implements Extension {
	public override async customPunishDM(
		punishment: PunishmentTypeDM,
		reason?: string | null,
		duration?: number,
		modlog?: string,
		sendFooter = true
	): Promise<boolean> {
		return punishDM({
			client: this.client,
			modlog,
			guild: this.guild,
			user: this,
			punishment,
			reason: reason ?? undefined,
			duration,
			sendFooter
		});
	}

	public override async customWarn(options: CustomPunishmentOptions): Promise<{ result: WarnResponse; caseNum: number | null }> {
		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return { result: warnResponse.CANNOT_RESOLVE_USER, caseNum: null };

		const ret = await (async (): Promise<{ result: WarnResponse; caseNum: number | null }> => {
			// add modlog entry
			const result = await createModLogEntry(
				{
					client: this.client,
					type: ModLogType.WARN,
					user: this,
					moderator: moderator.id,
					reason: options.reason,
					guild: this.guild,
					evidence: options.evidence,
					hidden: options.silent ?? false
				},
				true
			);
			caseID = result.log?.id;
			if (!result || !result.log) return { result: warnResponse.MODLOG_ERROR, caseNum: null };

			if (!options.silent) {
				// dm user
				const dmSuccess = await this.customPunishDM('warned', options.reason);
				dmSuccessEvent = dmSuccess;
				if (!dmSuccess) return { result: warnResponse.DM_ERROR, caseNum: result.caseNum };
			}

			return { result: warnResponse.SUCCESS, caseNum: result.caseNum };
		})();
		if (!([warnResponse.MODLOG_ERROR] as const).includes(ret.result) && !options.silent)
			this.client.emit(TanzaniteEvent.Warn, this, moderator, this.guild, options.reason ?? undefined, caseID!, dmSuccessEvent!);
		return ret;
	}

	public override async customAddRole(options: AddRoleOptions): Promise<AddRoleResponse> {
		// checks
		if (!this.guild.members.me!.permissions.has(PermissionFlagsBits.ManageRoles)) return addRoleResponse.MISSING_PERMISSIONS;
		const ifShouldAddRole = this.#checkIfShouldAddRole(options.role, options.moderator);
		if (ifShouldAddRole !== true) return ifShouldAddRole;

		let caseID: string | undefined = undefined;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return addRoleResponse.CANNOT_RESOLVE_USER;

		const ret = await (async () => {
			if (options.addToModlog || options.duration) {
				const { log: modlog } = await createModLogEntry({
					client: this.client,
					type: options.duration ? ModLogType.TEMP_PUNISHMENT_ROLE : ModLogType.PERM_PUNISHMENT_ROLE,
					guild: this.guild,
					moderator: moderator.id,
					user: this,
					reason: 'N/A',
					pseudo: !options.addToModlog,
					evidence: options.evidence,
					hidden: options.silent ?? false
				});

				if (!modlog) return addRoleResponse.MODLOG_ERROR;
				caseID = modlog.id;

				if (options.addToModlog || options.duration) {
					const punishmentEntrySuccess = await createPunishmentEntry({
						client: this.client,
						type: 'role',
						user: this,
						guild: this.guild,
						modlog: modlog.id,
						duration: options.duration,
						extraInfo: options.role.id
					});
					if (!punishmentEntrySuccess) return addRoleResponse.PUNISHMENT_ENTRY_ADD_ERROR;
				}
			}

			const removeRoleSuccess = await this.roles.add(options.role, `${moderator.tag}`);
			if (!removeRoleSuccess) return addRoleResponse.ACTION_ERROR;

			return addRoleResponse.SUCCESS;
		})();
		if (
			!(
				[addRoleResponse.ACTION_ERROR, addRoleResponse.MODLOG_ERROR, addRoleResponse.PUNISHMENT_ENTRY_ADD_ERROR] as const
			).includes(ret) &&
			options.addToModlog &&
			!options.silent
		)
			this.client.emit(
				TanzaniteEvent.PunishRoleAdd,
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				options.duration ?? 0,
				options.role,
				options.evidence
			);
		return ret;
	}

	public override async customRemoveRole(options: RemoveRoleOptions): Promise<RemoveRoleResponse> {
		// checks
		if (!this.guild.members.me!.permissions.has(PermissionFlagsBits.ManageRoles)) return removeRoleResponse.MISSING_PERMISSIONS;
		const ifShouldAddRole = this.#checkIfShouldAddRole(options.role, options.moderator);
		if (ifShouldAddRole !== true) return ifShouldAddRole;

		let caseID: string | undefined = undefined;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return removeRoleResponse.CANNOT_RESOLVE_USER;

		const ret = await (async () => {
			if (options.addToModlog) {
				const { log: modlog } = await createModLogEntry({
					client: this.client,
					type: ModLogType.REMOVE_PUNISHMENT_ROLE,
					guild: this.guild,
					moderator: moderator.id,
					user: this,
					reason: 'N/A',
					evidence: options.evidence,
					hidden: options.silent ?? false
				});

				if (!modlog) return removeRoleResponse.MODLOG_ERROR;
				caseID = modlog.id;

				const punishmentEntrySuccess = await removePunishmentEntry({
					client: this.client,
					type: 'role',
					user: this,
					guild: this.guild,
					extraInfo: options.role.id
				});

				if (!punishmentEntrySuccess) return removeRoleResponse.PUNISHMENT_ENTRY_REMOVE_ERROR;
			}

			const removeRoleSuccess = await this.roles.remove(options.role, `${moderator.tag}`);
			if (!removeRoleSuccess) return removeRoleResponse.ACTION_ERROR;

			return removeRoleResponse.SUCCESS;
		})();

		if (
			!(
				[
					removeRoleResponse.ACTION_ERROR,
					removeRoleResponse.MODLOG_ERROR,
					removeRoleResponse.PUNISHMENT_ENTRY_REMOVE_ERROR
				] as const
			).includes(ret) &&
			options.addToModlog &&
			!options.silent
		)
			this.client.emit(
				TanzaniteEvent.PunishRoleRemove,
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				options.role,
				options.evidence
			);
		return ret;
	}

	/**
	 * Check whether or not a role should be added/removed from the user based on hierarchy.
	 * @param role The role to check if can be modified.
	 * @param moderator The moderator that is trying to add/remove the role.
	 * @returns `true` if the role should be added/removed or a string for the reason why it shouldn't.
	 */
	#checkIfShouldAddRole(
		role: Role | Role,
		moderator?: GuildMember
	): true | 'user hierarchy' | 'role managed' | 'client hierarchy' {
		if (moderator && moderator.roles.highest.position <= role.position && this.guild.ownerId !== this.user.id) {
			return shouldAddRoleResponse.USER_HIERARCHY;
		} else if (role.managed) {
			return shouldAddRoleResponse.ROLE_MANAGED;
		} else if (this.guild.members.me!.roles.highest.position <= role.position) {
			return shouldAddRoleResponse.CLIENT_HIERARCHY;
		}
		return true;
	}

	public override async customMute(options: CustomTimedPunishmentOptions): Promise<MuteResponse> {
		// checks
		const checks = await checkMutePermissions(this.guild);
		if (checks !== true) return checks;

		const muteRoleID = (await this.guild.getSetting('muteRole'))!;
		const muteRole = this.guild.roles.cache.get(muteRoleID)!;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return muteResponse.CANNOT_RESOLVE_USER;

		const ret = await (async () => {
			// add role
			const muteSuccess = await this.roles
				.add(muteRole, `[Mute] ${moderator.tag} | ${options.reason ?? 'No reason provided.'}`)
				.catch(async (e) => {
					await this.client.console.warn('muteRoleAddError', e);
					this.client.console.debug(e);
					return false;
				});
			if (!muteSuccess) return muteResponse.ACTION_ERROR;

			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: options.duration ? ModLogType.TEMP_MUTE : ModLogType.PERM_MUTE,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				duration: options.duration,
				guild: this.guild,
				evidence: options.evidence,
				hidden: options.silent ?? false
			});

			if (!modlog) return muteResponse.MODLOG_ERROR;
			caseID = modlog.id;

			// add punishment entry so they can be unmuted later
			const punishmentEntrySuccess = await createPunishmentEntry({
				client: this.client,
				type: 'mute',
				user: this,
				guild: this.guild,
				duration: options.duration,
				modlog: modlog.id
			});

			if (!punishmentEntrySuccess) return muteResponse.PUNISHMENT_ENTRY_ADD_ERROR;

			if (!options.silent) {
				// dm user
				const dmSuccess = await this.customPunishDM('muted', options.reason, options.duration ?? 0, modlog.id);
				dmSuccessEvent = dmSuccess;
				if (!dmSuccess) return muteResponse.DM_ERROR;
			}

			return muteResponse.SUCCESS;
		})();

		if (
			!([muteResponse.ACTION_ERROR, muteResponse.MODLOG_ERROR, muteResponse.PUNISHMENT_ENTRY_ADD_ERROR] as const).includes(ret) &&
			!options.silent
		)
			this.client.emit(
				TanzaniteEvent.Mute,
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				options.duration ?? 0,
				dmSuccessEvent!,
				options.evidence
			);
		return ret;
	}

	public override async customUnmute(options: CustomPunishmentOptions): Promise<UnmuteResponse> {
		// checks
		const checks = await checkMutePermissions(this.guild);
		if (checks !== true) return checks;

		const muteRoleID = (await this.guild.getSetting('muteRole'))!;
		const muteRole = this.guild.roles.cache.get(muteRoleID)!;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return unmuteResponse.CANNOT_RESOLVE_USER;

		const ret = await (async () => {
			// remove role
			const muteSuccess = await this.roles
				.remove(muteRole, `[Unmute] ${moderator.tag} | ${options.reason ?? 'No reason provided.'}`)
				.catch(async (e) => {
					await this.client.console.warn('muteRoleAddError', formatError(e, true));
					return false;
				});
			if (!muteSuccess) return unmuteResponse.ACTION_ERROR;

			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: ModLogType.UNMUTE,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild,
				evidence: options.evidence,
				hidden: options.silent ?? false
			});

			if (!modlog) return unmuteResponse.MODLOG_ERROR;
			caseID = modlog.id;

			// remove mute entry
			const removePunishmentEntrySuccess = await removePunishmentEntry({
				client: this.client,
				type: 'mute',
				user: this,
				guild: this.guild
			});

			if (!removePunishmentEntrySuccess) return unmuteResponse.PUNISHMENT_ENTRY_REMOVE_ERROR;

			if (!options.silent) {
				// dm user
				const dmSuccess = await this.customPunishDM('unmuted', options.reason, undefined, '', false);
				dmSuccessEvent = dmSuccess;
				if (!dmSuccess) return unmuteResponse.DM_ERROR;
			}

			return unmuteResponse.SUCCESS;
		})();

		if (
			!(
				[unmuteResponse.ACTION_ERROR, unmuteResponse.MODLOG_ERROR, unmuteResponse.PUNISHMENT_ENTRY_REMOVE_ERROR] as const
			).includes(ret) &&
			!options.silent
		)
			this.client.emit(
				TanzaniteEvent.Unmute,
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				dmSuccessEvent!,
				options.evidence
			);
		return ret;
	}

	public override async customKick(options: CustomPunishmentOptions): Promise<KickResponse> {
		// checks
		if (!this.guild.members.me?.permissions.has(PermissionFlagsBits.KickMembers) || !this.kickable)
			return kickResponse.MISSING_PERMISSIONS;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return kickResponse.CANNOT_RESOLVE_USER;
		const ret = await (async () => {
			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: ModLogType.KICK,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild,
				evidence: options.evidence,
				hidden: options.silent ?? false
			});
			if (!modlog) return kickResponse.MODLOG_ERROR;
			caseID = modlog.id;

			// dm user
			const dmSuccess = options.silent ? null : await this.customPunishDM('kicked', options.reason, undefined, modlog.id);
			dmSuccessEvent = dmSuccess ?? undefined;

			// kick
			const kickSuccess = await this.kick(`${moderator?.tag} | ${options.reason ?? 'No reason provided.'}`).catch(() => false);
			if (!kickSuccess) return kickResponse.ACTION_ERROR;

			if (dmSuccess === false) return kickResponse.DM_ERROR;
			return kickResponse.SUCCESS;
		})();
		if (!([kickResponse.ACTION_ERROR, kickResponse.MODLOG_ERROR] as const).includes(ret) && !options.silent)
			this.client.emit(
				TanzaniteEvent.Kick,
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				dmSuccessEvent!,
				options.evidence
			);
		return ret;
	}

	public override async customBan(
		options: CustomBanOptions
	): Promise<Exclude<BanResponse, typeof banResponse['ALREADY_BANNED']>> {
		// checks
		if (!this.guild.members.me!.permissions.has(PermissionFlagsBits.BanMembers) || !this.bannable)
			return banResponse.MISSING_PERMISSIONS;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return banResponse.CANNOT_RESOLVE_USER;

		// ignore result, they should still be banned even if their mute cannot be removed
		await this.customUnmute({
			reason: 'User is about to be banned, a mute is no longer necessary.',
			moderator: this.guild.members.me!,
			silent: true
		});

		const ret = await (async () => {
			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: options.duration ? ModLogType.TEMP_BAN : ModLogType.PERM_BAN,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				duration: options.duration,
				guild: this.guild,
				evidence: options.evidence,
				hidden: options.silent ?? false
			});
			if (!modlog) return banResponse.MODLOG_ERROR;
			caseID = modlog.id;

			// dm user
			const dmSuccess = options.silent
				? null
				: await this.customPunishDM('banned', options.reason, options.duration ?? 0, modlog.id);
			dmSuccessEvent = dmSuccess ?? undefined;

			// ban
			const banSuccess = await this.ban({
				reason: `${moderator.tag} | ${options.reason ?? 'No reason provided.'}`,
				deleteMessageDays: options.deleteDays
			}).catch(() => false);
			if (!banSuccess) return banResponse.ACTION_ERROR;

			// add punishment entry so they can be unbanned later
			const punishmentEntrySuccess = await createPunishmentEntry({
				client: this.client,
				type: 'ban',
				user: this,
				guild: this.guild,
				duration: options.duration,
				modlog: modlog.id
			});
			if (!punishmentEntrySuccess) return banResponse.PUNISHMENT_ENTRY_ADD_ERROR;

			if (!dmSuccess) return banResponse.DM_ERROR;
			return banResponse.SUCCESS;
		})();
		if (
			!([banResponse.ACTION_ERROR, banResponse.MODLOG_ERROR, banResponse.PUNISHMENT_ENTRY_ADD_ERROR] as const).includes(ret) &&
			!options.silent
		)
			this.client.emit(
				TanzaniteEvent.Ban,
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				options.duration ?? 0,
				dmSuccessEvent!,
				options.evidence
			);
		return ret;
	}

	public override async customBlock(options: BlockOptions): Promise<BlockResponse> {
		const channel = this.guild.channels.resolve(options.channel);
		if (!channel || (!channel.isTextBased() && !channel.isThread())) return blockResponse.INVALID_CHANNEL;

		// checks
		if (!channel.permissionsFor(this.guild.members.me!)!.has(PermissionFlagsBits.ManageChannels))
			return blockResponse.MISSING_PERMISSIONS;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return blockResponse.CANNOT_RESOLVE_USER;

		const ret = await (async () => {
			// change channel permissions
			const channelToUse = channel.isThread() ? channel.parent! : channel;
			const perm = channel.isThread() ? { SendMessagesInThreads: false } : { SendMessages: false };
			const blockSuccess = await channelToUse.permissionOverwrites
				.edit(this, perm, { reason: `[Block] ${moderator.tag} | ${options.reason ?? 'No reason provided.'}` })
				.catch(() => false);
			if (!blockSuccess) return blockResponse.ACTION_ERROR;

			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: options.duration ? ModLogType.TEMP_CHANNEL_BLOCK : ModLogType.PERM_CHANNEL_BLOCK,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild,
				evidence: options.evidence,
				hidden: options.silent ?? false
			});
			if (!modlog) return blockResponse.MODLOG_ERROR;
			caseID = modlog.id;

			// add punishment entry so they can be unblocked later
			const punishmentEntrySuccess = await createPunishmentEntry({
				client: this.client,
				type: 'block',
				user: this,
				guild: this.guild,
				duration: options.duration,
				modlog: modlog.id,
				extraInfo: channel.id
			});
			if (!punishmentEntrySuccess) return blockResponse.PUNISHMENT_ENTRY_ADD_ERROR;

			// dm user
			const dmSuccess = options.silent
				? null
				: await punishDM({
						client: this.client,
						punishment: 'blocked',
						reason: options.reason ?? undefined,
						duration: options.duration ?? 0,
						modlog: modlog.id,
						guild: this.guild,
						user: this,
						sendFooter: true,
						channel: channel.id
				  });
			dmSuccessEvent = !!dmSuccess;
			if (!dmSuccess) return blockResponse.DM_ERROR;

			return blockResponse.SUCCESS;
		})();

		if (
			!([blockResponse.ACTION_ERROR, blockResponse.MODLOG_ERROR, blockResponse.PUNISHMENT_ENTRY_ADD_ERROR] as const).includes(
				ret
			) &&
			!options.silent
		)
			this.client.emit(
				TanzaniteEvent.Block,
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				options.duration ?? 0,
				dmSuccessEvent!,
				channel,
				options.evidence
			);
		return ret;
	}

	public override async customUnblock(options: UnblockOptions): Promise<UnblockResponse> {
		const _channel = this.guild.channels.resolve(options.channel);
		if (!_channel || (_channel.type !== ChannelType.GuildText && !_channel.isThread())) return unblockResponse.INVALID_CHANNEL;
		const channel = _channel as GuildTextBasedChannel;

		// checks
		if (!channel.permissionsFor(this.guild.members.me!)!.has(PermissionFlagsBits.ManageChannels))
			return unblockResponse.MISSING_PERMISSIONS;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return unblockResponse.CANNOT_RESOLVE_USER;

		const ret = await (async () => {
			// change channel permissions
			const channelToUse = channel.isThread() ? channel.parent! : channel;
			const perm = channel.isThread() ? { SendMessagesInThreads: null } : { SendMessages: null };
			const blockSuccess = await channelToUse.permissionOverwrites
				.edit(this, perm, { reason: `[Unblock] ${moderator.tag} | ${options.reason ?? 'No reason provided.'}` })
				.catch(() => false);
			if (!blockSuccess) return unblockResponse.ACTION_ERROR;

			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: ModLogType.CHANNEL_UNBLOCK,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild,
				evidence: options.evidence,
				hidden: options.silent ?? false
			});
			if (!modlog) return unblockResponse.MODLOG_ERROR;
			caseID = modlog.id;

			// remove punishment entry
			const punishmentEntrySuccess = await removePunishmentEntry({
				client: this.client,
				type: 'block',
				user: this,
				guild: this.guild,
				extraInfo: channel.id
			});
			if (!punishmentEntrySuccess) return unblockResponse.ACTION_ERROR;

			// dm user
			const dmSuccess = options.silent
				? null
				: await punishDM({
						client: this.client,
						punishment: 'unblocked',
						reason: options.reason ?? undefined,
						guild: this.guild,
						user: this,
						sendFooter: false,
						channel: channel.id
				  });
			dmSuccessEvent = !!dmSuccess;
			if (!dmSuccess) return blockResponse.DM_ERROR;

			dmSuccessEvent = !!dmSuccess;
			if (!dmSuccess) return unblockResponse.DM_ERROR;

			return unblockResponse.SUCCESS;
		})();

		if (
			!([unblockResponse.ACTION_ERROR, unblockResponse.MODLOG_ERROR, unblockResponse.ACTION_ERROR] as const).includes(ret) &&
			!options.silent
		)
			this.client.emit(
				TanzaniteEvent.Unblock,
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				dmSuccessEvent!,
				channel,
				options.evidence
			);
		return ret;
	}

	public override async customTimeout(options: CustomTimeoutOptions): Promise<TimeoutResponse> {
		// checks
		if (!this.guild.members.me!.permissions.has(PermissionFlagsBits.ModerateMembers)) return timeoutResponse.MISSING_PERMISSIONS;

		const twentyEightDays = Time.Day * 28;
		if (options.duration > twentyEightDays) return timeoutResponse.INVALID_DURATION;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return timeoutResponse.CANNOT_RESOLVE_USER;

		const ret = await (async () => {
			// timeout
			const timeoutSuccess = await this.timeout(
				options.duration,
				`${moderator.tag} | ${options.reason ?? 'No reason provided.'}`
			).catch(() => false);
			if (!timeoutSuccess) return timeoutResponse.ACTION_ERROR;

			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: ModLogType.TIMEOUT,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				duration: options.duration,
				guild: this.guild,
				evidence: options.evidence,
				hidden: options.silent ?? false
			});

			if (!modlog) return timeoutResponse.MODLOG_ERROR;
			caseID = modlog.id;

			if (!options.silent) {
				// dm user
				const dmSuccess = await this.customPunishDM('timedout', options.reason, options.duration, modlog.id);
				dmSuccessEvent = dmSuccess;
				if (!dmSuccess) return timeoutResponse.DM_ERROR;
			}

			return timeoutResponse.SUCCESS;
		})();

		if (!([timeoutResponse.ACTION_ERROR, timeoutResponse.MODLOG_ERROR] as const).includes(ret) && !options.silent)
			this.client.emit(
				TanzaniteEvent.Timeout,
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				options.duration ?? 0,
				dmSuccessEvent!,
				options.evidence
			);
		return ret;
	}

	public override async customRemoveTimeout(options: CustomPunishmentOptions): Promise<RemoveTimeoutResponse> {
		// checks
		if (!this.guild.members.me!.permissions.has(PermissionFlagsBits.ModerateMembers))
			return removeTimeoutResponse.MISSING_PERMISSIONS;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return removeTimeoutResponse.CANNOT_RESOLVE_USER;

		const ret = await (async () => {
			// remove timeout
			const timeoutSuccess = await this.timeout(null, `${moderator.tag} | ${options.reason ?? 'No reason provided.'}`).catch(
				() => false
			);
			if (!timeoutSuccess) return removeTimeoutResponse.ACTION_ERROR;

			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: ModLogType.REMOVE_TIMEOUT,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild,
				evidence: options.evidence,
				hidden: options.silent ?? false
			});

			if (!modlog) return removeTimeoutResponse.MODLOG_ERROR;
			caseID = modlog.id;

			if (!options.silent) {
				// dm user
				const dmSuccess = await this.customPunishDM('untimedout', options.reason, undefined, '', false);
				dmSuccessEvent = dmSuccess;
				if (!dmSuccess) return removeTimeoutResponse.DM_ERROR;
			}

			return removeTimeoutResponse.SUCCESS;
		})();

		if (!([removeTimeoutResponse.ACTION_ERROR, removeTimeoutResponse.MODLOG_ERROR] as const).includes(ret) && !options.silent)
			this.client.emit(
				TanzaniteEvent.RemoveTimeout,
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				dmSuccessEvent!,
				options.evidence
			);
		return ret;
	}

	public override isOwner(): boolean {
		return this.client.isOwner(this);
	}

	public override isSuperUser(): boolean {
		return this.client.isSuperUser(this);
	}
}

/**
 * Options for punishing a user.
 */
export interface CustomPunishmentOptions {
	/**
	 * The reason for the punishment.
	 */
	reason?: string | null;

	/**
	 * The moderator who punished the user.
	 */
	moderator?: GuildMember;

	/**
	 * Evidence for the punishment.
	 */
	evidence?: string;

	/**
	 * Makes the punishment silent by not sending the user a punishment dm and not broadcasting the event to be logged.
	 */
	silent?: boolean;
}

/**
 * Punishment options for punishments that can be temporary.
 */
export interface CustomTimedPunishmentOptions extends CustomPunishmentOptions {
	/**
	 * The duration of the punishment.
	 */
	duration?: number;
}

/**
 * Options for a role add punishment.
 */
export interface AddRoleOptions extends CustomTimedPunishmentOptions {
	/**
	 * The role to add to the user.
	 */
	role: Role;

	/**
	 * Whether to create a modlog entry for this punishment.
	 */
	addToModlog: boolean;
}

/**
 * Options for a role remove punishment.
 */
export interface RemoveRoleOptions extends CustomTimedPunishmentOptions {
	/**
	 * The role to remove from the user.
	 */
	role: Role;

	/**
	 * Whether to create a modlog entry for this punishment.
	 */
	addToModlog: boolean;
}

/**
 * Options for banning a user.
 */
export interface CustomBanOptions extends CustomTimedPunishmentOptions {
	/**
	 * The number of days to delete the user's messages for.
	 */
	deleteDays?: number;
}

/**
 * Options for blocking a user from a channel.
 */
export interface BlockOptions extends CustomTimedPunishmentOptions {
	/**
	 * The channel to block the user from.
	 */
	channel: GuildChannelResolvable;
}

/**
 * Options for unblocking a user from a channel.
 */
export interface UnblockOptions extends CustomPunishmentOptions {
	/**
	 * The channel to unblock the user from.
	 */
	channel: GuildChannelResolvable;
}

/**
 * Punishment options for punishments that can be temporary.
 */
export interface CustomTimeoutOptions extends CustomPunishmentOptions {
	/**
	 * The duration of the punishment.
	 */
	duration: number;
}

export const basePunishmentResponse = Object.freeze({
	SUCCESS: 'success',
	MODLOG_ERROR: 'error creating modlog entry',
	ACTION_ERROR: 'error performing action',
	CANNOT_RESOLVE_USER: 'cannot resolve user'
} as const);

export const dmResponse = Object.freeze({
	...basePunishmentResponse,
	DM_ERROR: 'failed to dm'
} as const);

export const permissionsResponse = Object.freeze({
	MISSING_PERMISSIONS: 'missing permissions'
} as const);

export const punishmentEntryAdd = Object.freeze({
	PUNISHMENT_ENTRY_ADD_ERROR: 'error creating punishment entry'
} as const);

export const punishmentEntryRemove = Object.freeze({
	PUNISHMENT_ENTRY_REMOVE_ERROR: 'error removing punishment entry'
} as const);

export const shouldAddRoleResponse = Object.freeze({
	USER_HIERARCHY: 'user hierarchy',
	CLIENT_HIERARCHY: 'client hierarchy',
	ROLE_MANAGED: 'role managed'
} as const);

export const baseBlockResponse = Object.freeze({
	INVALID_CHANNEL: 'invalid channel'
} as const);

export const baseMuteResponse = Object.freeze({
	NO_MUTE_ROLE: 'no mute role',
	MUTE_ROLE_INVALID: 'invalid mute role',
	MUTE_ROLE_NOT_MANAGEABLE: 'mute role not manageable'
} as const);

export const warnResponse = Object.freeze({
	...dmResponse
} as const);

export const addRoleResponse = Object.freeze({
	...basePunishmentResponse,
	...permissionsResponse,
	...shouldAddRoleResponse,
	...punishmentEntryAdd
} as const);

export const removeRoleResponse = Object.freeze({
	...basePunishmentResponse,
	...permissionsResponse,
	...shouldAddRoleResponse,
	...punishmentEntryRemove
} as const);

export const muteResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse,
	...baseMuteResponse,
	...punishmentEntryAdd
} as const);

export const unmuteResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse,
	...baseMuteResponse,
	...punishmentEntryRemove
} as const);

export const kickResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse
} as const);

export const banResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse,
	...punishmentEntryAdd,
	ALREADY_BANNED: 'already banned'
} as const);

export const blockResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse,
	...baseBlockResponse,
	...punishmentEntryAdd
});

export const unblockResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse,
	...baseBlockResponse,
	...punishmentEntryRemove
});

export const timeoutResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse,
	INVALID_DURATION: 'duration too long'
} as const);

export const removeTimeoutResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse
} as const);

/**
 * Response returned when warning a user.
 */
export type WarnResponse = ValueOf<typeof warnResponse>;

/**
 * Response returned when adding a role to a user.
 */
export type AddRoleResponse = ValueOf<typeof addRoleResponse>;

/**
 * Response returned when removing a role from a user.
 */
export type RemoveRoleResponse = ValueOf<typeof removeRoleResponse>;

/**
 * Response returned when muting a user.
 */
export type MuteResponse = ValueOf<typeof muteResponse>;

/**
 * Response returned when unmuting a user.
 */
export type UnmuteResponse = ValueOf<typeof unmuteResponse>;

/**
 * Response returned when kicking a user.
 */
export type KickResponse = ValueOf<typeof kickResponse>;

/**
 * Response returned when banning a user.
 */
export type BanResponse = ValueOf<typeof banResponse>;

/**
 * Response returned when blocking a user.
 */
export type BlockResponse = ValueOf<typeof blockResponse>;

/**
 * Response returned when unblocking a user.
 */
export type UnblockResponse = ValueOf<typeof unblockResponse>;

/**
 * Response returned when timing out a user.
 */
export type TimeoutResponse = ValueOf<typeof timeoutResponse>;

/**
 * Response returned when removing a timeout from a user.
 */
export type RemoveTimeoutResponse = ValueOf<typeof removeTimeoutResponse>;

/**
 * @typedef {BotClientEvents} VSCodePleaseDontRemove
 */
