/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	BushClientEvents,
	Moderation,
	ModLogType,
	type BushClient,
	type BushGuild,
	type BushGuildTextBasedChannel,
	type BushGuildTextChannelResolvable,
	type BushRole,
	type BushThreadChannelResolvable,
	type BushUser
} from '#lib';
import { GuildMember, type Partialize, type Role } from 'discord.js';
import type { RawGuildMemberData } from 'discord.js/typings/rawDataTypes';
/* eslint-enable @typescript-eslint/no-unused-vars */

/**
 * Represents a member of a guild on Discord.
 */
export class BushGuildMember extends GuildMember {
	public declare readonly client: BushClient;
	public declare guild: BushGuild;
	public declare user: BushUser;

	public constructor(client: BushClient, data: RawGuildMemberData, guild: BushGuild) {
		super(client, data, guild);
	}

	/**
	 * Send a punishment dm to the user.
	 * @param punishment The punishment that the user has received.
	 * @param reason The reason for the user's punishment.
	 * @param duration The duration of the punishment.
	 * @param sendFooter Whether or not to send the guild's punishment footer with the dm.
	 * @returns Whether or not the dm was sent successfully.
	 */
	public async bushPunishDM(punishment: string, reason?: string | null, duration?: number, sendFooter = true): Promise<boolean> {
		return Moderation.punishDM({ guild: this.guild, user: this, punishment, reason: reason ?? undefined, duration, sendFooter });
	}

	/**
	 * Warn the user, create a modlog entry, and send a dm to the user.
	 * @param options Options for warning the user.
	 * @returns An object with the result of the warning, and the case number of the warn.
	 * @emits {@link BushClientEvents.bushWarn}
	 */
	public async bushWarn(options: BushPunishmentOptions): Promise<{ result: WarnResponse; caseNum: number | null }> {
		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = (await util.resolveNonCachedUser(options.moderator ?? this.guild.me))!;

		const ret = await (async (): Promise<{ result: WarnResponse; caseNum: number | null }> => {
			// add modlog entry
			const result = await Moderation.createModLogEntry(
				{
					type: ModLogType.WARN,
					user: this,
					moderator: moderator.id,
					reason: options.reason,
					guild: this.guild,
					evidence: options.evidence
				},
				true
			);
			caseID = result.log?.id;
			if (!result || !result.log) return { result: warnResponse.MODLOG_ERROR, caseNum: null };

			// dm user
			const dmSuccess = await this.bushPunishDM('warned', options.reason);
			dmSuccessEvent = dmSuccess;
			if (!dmSuccess) return { result: warnResponse.DM_ERROR, caseNum: result.caseNum };

			return { result: warnResponse.SUCCESS, caseNum: result.caseNum };
		})();
		if (!([warnResponse.MODLOG_ERROR] as const).includes(ret.result))
			client.emit('bushWarn', this, moderator, this.guild, options.reason ?? undefined, caseID!, dmSuccessEvent!);
		return ret;
	}

	/**
	 * Add a role to the user, if it is a punishment create a modlog entry, and create a punishment entry if it is temporary or a punishment.
	 * @param options Options for adding a role to the user.
	 * @returns A status message for adding the add.
	 * @emits {@link BushClientEvents.bushPunishRole}
	 */
	public async bushAddRole(options: AddRoleOptions): Promise<AddRoleResponse> {
		// checks
		if (!this.guild.me!.permissions.has('MANAGE_ROLES')) return addRoleResponse.MISSING_PERMISSIONS;
		const ifShouldAddRole = this.#checkIfShouldAddRole(options.role, options.moderator);
		if (ifShouldAddRole !== true) return ifShouldAddRole;

		let caseID: string | undefined = undefined;
		const moderator = (await util.resolveNonCachedUser(options.moderator ?? this.guild.me))!;

		const ret = await (async () => {
			if (options.addToModlog || options.duration) {
				const { log: modlog } = await Moderation.createModLogEntry({
					type: options.duration ? ModLogType.TEMP_PUNISHMENT_ROLE : ModLogType.PERM_PUNISHMENT_ROLE,
					guild: this.guild,
					moderator: moderator.id,
					user: this,
					reason: 'N/A',
					pseudo: !options.addToModlog,
					evidence: options.evidence
				});

				if (!modlog) return addRoleResponse.MODLOG_ERROR;
				caseID = modlog.id;

				if (options.addToModlog || options.duration) {
					const punishmentEntrySuccess = await Moderation.createPunishmentEntry({
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
			options.addToModlog
		)
			client.emit(
				'bushPunishRole',
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				options.duration ?? 0,
				options.role as BushRole,
				options.evidence
			);
		return ret;
	}

	/**
	 * Remove a role from the user, if it is a punishment create a modlog entry, and destroy a punishment entry if it was temporary or a punishment.
	 * @param options Options for removing a role from the user.
	 * @returns A status message for removing the role.
	 * @emits {@link BushClientEvents.bushPunishRoleRemove}
	 */
	public async bushRemoveRole(options: RemoveRoleOptions): Promise<RemoveRoleResponse> {
		// checks
		if (!this.guild.me!.permissions.has('MANAGE_ROLES')) return removeRoleResponse.MISSING_PERMISSIONS;
		const ifShouldAddRole = this.#checkIfShouldAddRole(options.role, options.moderator);
		if (ifShouldAddRole !== true) return ifShouldAddRole;

		let caseID: string | undefined = undefined;
		const moderator = (await util.resolveNonCachedUser(options.moderator ?? this.guild.me))!;

		const ret = await (async () => {
			if (options.addToModlog) {
				const { log: modlog } = await Moderation.createModLogEntry({
					type: ModLogType.REMOVE_PUNISHMENT_ROLE,
					guild: this.guild,
					moderator: moderator.id,
					user: this,
					reason: 'N/A',
					evidence: options.evidence
				});

				if (!modlog) return removeRoleResponse.MODLOG_ERROR;
				caseID = modlog.id;

				const punishmentEntrySuccess = await Moderation.removePunishmentEntry({
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
			options.addToModlog
		)
			client.emit(
				'bushPunishRoleRemove',
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				options.role as BushRole,
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
		role: BushRole | Role,
		moderator?: BushGuildMember
	): true | 'user hierarchy' | 'role managed' | 'client hierarchy' {
		if (moderator && moderator.roles.highest.position <= role.position && this.guild.ownerId !== this.user.id) {
			return shouldAddRoleResponse.USER_HIERARCHY;
		} else if (role.managed) {
			return shouldAddRoleResponse.ROLE_MANAGED;
		} else if (this.guild.me!.roles.highest.position <= role.position) {
			return shouldAddRoleResponse.CLIENT_HIERARCHY;
		}
		return true;
	}

	/**
	 * Mute the user, create a modlog entry, creates a punishment entry, and dms the user.
	 * @param options Options for muting the user.
	 * @returns A status message for muting the user.
	 * @emits {@link BushClientEvents.bushMute}
	 */
	public async bushMute(options: BushTimedPunishmentOptions): Promise<MuteResponse> {
		// checks
		if (!this.guild.me!.permissions.has('MANAGE_ROLES')) return muteResponse.MISSING_PERMISSIONS;
		const muteRoleID = await this.guild.getSetting('muteRole');
		if (!muteRoleID) return muteResponse.NO_MUTE_ROLE;
		const muteRole = this.guild.roles.cache.get(muteRoleID);
		if (!muteRole) return muteResponse.MUTE_ROLE_INVALID;
		if (muteRole.position >= this.guild.me!.roles.highest.position || muteRole.managed)
			return muteResponse.MUTE_ROLE_NOT_MANAGEABLE;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = (await util.resolveNonCachedUser(options.moderator ?? this.guild.me))!;

		const ret = await (async () => {
			// add role
			const muteSuccess = await this.roles
				.add(muteRole, `[Mute] ${moderator.tag} | ${options.reason ?? 'No reason provided.'}`)
				.catch(async (e) => {
					await client.console.warn('muteRoleAddError', e);
					client.console.debug(e);
					return false;
				});
			if (!muteSuccess) return muteResponse.ACTION_ERROR;

			// add modlog entry
			const { log: modlog } = await Moderation.createModLogEntry({
				type: options.duration ? ModLogType.TEMP_MUTE : ModLogType.PERM_MUTE,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				duration: options.duration,
				guild: this.guild,
				evidence: options.evidence
			});

			if (!modlog) return muteResponse.MODLOG_ERROR;
			caseID = modlog.id;

			// add punishment entry so they can be unmuted later
			const punishmentEntrySuccess = await Moderation.createPunishmentEntry({
				type: 'mute',
				user: this,
				guild: this.guild,
				duration: options.duration,
				modlog: modlog.id
			});

			if (!punishmentEntrySuccess) return muteResponse.PUNISHMENT_ENTRY_ADD_ERROR;

			// dm user
			const dmSuccess = await this.bushPunishDM('muted', options.reason, options.duration ?? 0);
			dmSuccessEvent = dmSuccess;

			if (!dmSuccess) return muteResponse.DM_ERROR;

			return muteResponse.SUCCESS;
		})();

		if (!([muteResponse.ACTION_ERROR, muteResponse.MODLOG_ERROR, muteResponse.PUNISHMENT_ENTRY_ADD_ERROR] as const).includes(ret))
			client.emit(
				'bushMute',
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

	/**
	 * Unmute the user, create a modlog entry, remove the punishment entry, and dm the user.
	 * @param options Options for unmuting the user.
	 * @returns A status message for unmuting the user.
	 * @emits {@link BushClientEvents.bushUnmute}
	 */
	public async bushUnmute(options: BushPunishmentOptions): Promise<UnmuteResponse> {
		// checks
		if (!this.guild.me!.permissions.has('MANAGE_ROLES')) return unmuteResponse.MISSING_PERMISSIONS;
		const muteRoleID = await this.guild.getSetting('muteRole');
		if (!muteRoleID) return unmuteResponse.NO_MUTE_ROLE;
		const muteRole = this.guild.roles.cache.get(muteRoleID);
		if (!muteRole) return unmuteResponse.MUTE_ROLE_INVALID;
		if (muteRole.position >= this.guild.me!.roles.highest.position || muteRole.managed)
			return unmuteResponse.MUTE_ROLE_NOT_MANAGEABLE;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = (await util.resolveNonCachedUser(options.moderator ?? this.guild.me))!;

		const ret = await (async () => {
			// remove role
			const muteSuccess = await this.roles
				.remove(muteRole, `[Unmute] ${moderator.tag} | ${options.reason ?? 'No reason provided.'}`)
				.catch(async (e) => {
					await client.console.warn('muteRoleAddError', e?.stack || e);
					return false;
				});
			if (!muteSuccess) return unmuteResponse.ACTION_ERROR;

			// add modlog entry
			const { log: modlog } = await Moderation.createModLogEntry({
				type: ModLogType.UNMUTE,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild,
				evidence: options.evidence
			});

			if (!modlog) return unmuteResponse.MODLOG_ERROR;
			caseID = modlog.id;

			// remove mute entry
			const removePunishmentEntrySuccess = await Moderation.removePunishmentEntry({
				type: 'mute',
				user: this,
				guild: this.guild
			});

			if (!removePunishmentEntrySuccess) return unmuteResponse.PUNISHMENT_ENTRY_REMOVE_ERROR;

			// dm user
			const dmSuccess = await this.bushPunishDM('unmuted', options.reason, undefined, false);
			dmSuccessEvent = dmSuccess;

			if (!dmSuccess) return unmuteResponse.DM_ERROR;

			return unmuteResponse.SUCCESS;
		})();

		if (
			!(
				[unmuteResponse.ACTION_ERROR, unmuteResponse.MODLOG_ERROR, unmuteResponse.PUNISHMENT_ENTRY_REMOVE_ERROR] as const
			).includes(ret)
		)
			client.emit(
				'bushUnmute',
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

	/**
	 * Kick the user, create a modlog entry, and dm the user.
	 * @param options Options for kicking the user.
	 * @returns A status message for kicking the user.
	 * @emits {@link BushClientEvents.bushKick}
	 */
	public async bushKick(options: BushPunishmentOptions): Promise<KickResponse> {
		// checks
		if (!this.guild.me?.permissions.has('KICK_MEMBERS') || !this.kickable) return kickResponse.MISSING_PERMISSIONS;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = (await util.resolveNonCachedUser(options.moderator ?? this.guild.me))!;
		const ret = await (async () => {
			// dm user
			const dmSuccess = await this.bushPunishDM('kicked', options.reason);
			dmSuccessEvent = dmSuccess;

			// kick
			const kickSuccess = await this.kick(`${moderator?.tag} | ${options.reason ?? 'No reason provided.'}`).catch(() => false);
			if (!kickSuccess) return kickResponse.ACTION_ERROR;

			// add modlog entry
			const { log: modlog } = await Moderation.createModLogEntry({
				type: ModLogType.KICK,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild,
				evidence: options.evidence
			});
			if (!modlog) return kickResponse.MODLOG_ERROR;
			caseID = modlog.id;
			if (!dmSuccess) return kickResponse.DM_ERROR;
			return kickResponse.SUCCESS;
		})();
		if (!([kickResponse.ACTION_ERROR, kickResponse.MODLOG_ERROR] as const).includes(ret))
			client.emit(
				'bushKick',
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

	/**
	 * Ban the user, create a modlog entry, create a punishment entry, and dm the user.
	 * @param options Options for banning the user.
	 * @returns A status message for banning the user.
	 * @emits {@link BushClientEvents.bushBan}
	 */
	public async bushBan(options: BushBanOptions): Promise<BanResponse> {
		// checks
		if (!this.guild.me!.permissions.has('BAN_MEMBERS') || !this.bannable) return banResponse.MISSING_PERMISSIONS;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = (await util.resolveNonCachedUser(options.moderator ?? this.guild.me))!;

		// ignore result, they should still be banned even if their mute cannot be removed
		await this.bushUnmute({
			reason: 'User is about to be banned, a mute is no longer necessary.',
			moderator: this.guild.me!
		});

		const ret = await (async () => {
			// dm user
			const dmSuccess = await this.bushPunishDM('banned', options.reason, options.duration ?? 0);
			dmSuccessEvent = dmSuccess;

			// ban
			const banSuccess = await this.ban({
				reason: `${moderator.tag} | ${options.reason ?? 'No reason provided.'}`,
				days: options.deleteDays
			}).catch(() => false);
			if (!banSuccess) return banResponse.ACTION_ERROR;

			// add modlog entry
			const { log: modlog } = await Moderation.createModLogEntry({
				type: options.duration ? ModLogType.TEMP_BAN : ModLogType.PERM_BAN,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				duration: options.duration,
				guild: this.guild,
				evidence: options.evidence
			});
			if (!modlog) return banResponse.MODLOG_ERROR;
			caseID = modlog.id;

			// add punishment entry so they can be unbanned later
			const punishmentEntrySuccess = await Moderation.createPunishmentEntry({
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
		if (!([banResponse.ACTION_ERROR, banResponse.MODLOG_ERROR, banResponse.PUNISHMENT_ENTRY_ADD_ERROR] as const).includes(ret))
			client.emit(
				'bushBan',
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

	/**
	 * Prevents a user from speaking in a channel.
	 * @param options Options for blocking the user.
	 */
	public async bushBlock(options: BlockOptions): Promise<BlockResponse> {
		const _channel = this.guild.channels.resolve(options.channel);
		if (!_channel || (!_channel.isText() && !_channel.isThread())) return blockResponse.INVALID_CHANNEL;
		const channel = _channel as BushGuildTextBasedChannel;

		// checks
		if (!channel.permissionsFor(this.guild.me!)!.has('MANAGE_CHANNELS')) return blockResponse.MISSING_PERMISSIONS;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = (await util.resolveNonCachedUser(options.moderator ?? this.guild.me))!;

		const ret = await (async () => {
			// change channel permissions
			const channelToUse = channel.isThread() ? channel.parent! : channel;
			const perm = channel.isThread() ? { SEND_MESSAGES_IN_THREADS: false } : { SEND_MESSAGES: false };
			const blockSuccess = await channelToUse.permissionOverwrites
				.edit(this, perm, { reason: `[Block] ${moderator.tag} | ${options.reason ?? 'No reason provided.'}` })
				.catch(() => false);
			if (!blockSuccess) return blockResponse.ACTION_ERROR;

			// add modlog entry
			const { log: modlog } = await Moderation.createModLogEntry({
				type: options.duration ? ModLogType.TEMP_CHANNEL_BLOCK : ModLogType.PERM_CHANNEL_BLOCK,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild,
				evidence: options.evidence
			});
			if (!modlog) return blockResponse.MODLOG_ERROR;
			caseID = modlog.id;

			// add punishment entry so they can be unblocked later
			const punishmentEntrySuccess = await Moderation.createPunishmentEntry({
				type: 'block',
				user: this,
				guild: this.guild,
				duration: options.duration,
				modlog: modlog.id,
				extraInfo: channel.id
			});
			if (!punishmentEntrySuccess) return blockResponse.PUNISHMENT_ENTRY_ADD_ERROR;

			// dm user
			const dmSuccess = await this.send({
				content: `You have been blocked from <#${channel.id}> in **${this.guild.name}** ${
					options.duration !== null && options.duration !== undefined
						? options.duration
							? `for ${util.humanizeDuration(options.duration)} `
							: 'permanently '
						: ''
				}for **${options.reason?.trim() ? options.reason?.trim() : 'No reason provided'}**.`
			}).catch(() => false);
			dmSuccessEvent = !!dmSuccess;

			if (!dmSuccess) return blockResponse.DM_ERROR;

			return blockResponse.SUCCESS;
		})();

		if (
			!([blockResponse.ACTION_ERROR, blockResponse.MODLOG_ERROR, blockResponse.PUNISHMENT_ENTRY_ADD_ERROR] as const).includes(ret)
		)
			client.emit(
				'bushBlock',
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

	/**
	 * Allows a user to speak in a channel.
	 * @param options Options for unblocking the user.
	 */
	public async bushUnblock(options: UnblockOptions): Promise<UnblockResponse> {
		const _channel = this.guild.channels.resolve(options.channel);
		if (!_channel || (!_channel.isText() && !_channel.isThread())) return unblockResponse.INVALID_CHANNEL;
		const channel = _channel as BushGuildTextBasedChannel;

		// checks
		if (!channel.permissionsFor(this.guild.me!)!.has('MANAGE_CHANNELS')) return unblockResponse.MISSING_PERMISSIONS;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = (await util.resolveNonCachedUser(options.moderator ?? this.guild.me))!;

		const ret = await (async () => {
			// change channel permissions
			const channelToUse = channel.isThread() ? channel.parent! : channel;
			const perm = channel.isThread() ? { SEND_MESSAGES_IN_THREADS: null } : { SEND_MESSAGES: null };
			const blockSuccess = await channelToUse.permissionOverwrites
				.edit(this, perm, { reason: `[Unblock] ${moderator.tag} | ${options.reason ?? 'No reason provided.'}` })
				.catch(() => false);
			if (!blockSuccess) return unblockResponse.ACTION_ERROR;

			// add modlog entry
			const { log: modlog } = await Moderation.createModLogEntry({
				type: ModLogType.CHANNEL_UNBLOCK,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild,
				evidence: options.evidence
			});
			if (!modlog) return unblockResponse.MODLOG_ERROR;
			caseID = modlog.id;

			// remove punishment entry
			const punishmentEntrySuccess = await Moderation.removePunishmentEntry({
				type: 'block',
				user: this,
				guild: this.guild,
				extraInfo: channel.id
			});
			if (!punishmentEntrySuccess) return unblockResponse.ACTION_ERROR;

			// dm user
			const dmSuccess = await this.send({
				content: `You have been unblocked from <#${channel.id}> in **${this.guild.name}** for **${
					options.reason?.trim() ? options.reason?.trim() : 'No reason provided'
				}**.`
			}).catch(() => false);
			dmSuccessEvent = !!dmSuccess;

			if (!dmSuccess) return unblockResponse.DM_ERROR;

			return unblockResponse.SUCCESS;
		})();

		if (!([unblockResponse.ACTION_ERROR, unblockResponse.MODLOG_ERROR, unblockResponse.ACTION_ERROR] as const).includes(ret))
			client.emit(
				'bushUnblock',
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

	/**
	 * Mutes a user using discord's timeout feature.
	 * @param options Options for timing out the user.
	 */
	public async bushTimeout(options: BushTimeoutOptions): Promise<TimeoutResponse> {
		// checks
		if (!this.guild.me!.permissions.has('MODERATE_MEMBERS')) return timeoutResponse.MISSING_PERMISSIONS;

		const twentyEightDays = client.consts.timeUnits.days.value * 28;
		if (options.duration > twentyEightDays) return timeoutResponse.INVALID_DURATION;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = (await util.resolveNonCachedUser(options.moderator ?? this.guild.me))!;

		const ret = await (async () => {
			// timeout
			const timeoutSuccess = await this.timeout(
				options.duration,
				`${moderator.tag} | ${options.reason ?? 'No reason provided.'}`
			).catch(() => false);
			if (!timeoutSuccess) return timeoutResponse.ACTION_ERROR;

			// add modlog entry
			const { log: modlog } = await Moderation.createModLogEntry({
				type: ModLogType.TIMEOUT,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				duration: options.duration,
				guild: this.guild,
				evidence: options.evidence
			});

			if (!modlog) return timeoutResponse.MODLOG_ERROR;
			caseID = modlog.id;

			// dm user
			const dmSuccess = await this.bushPunishDM('timed out', options.reason, options.duration);
			dmSuccessEvent = dmSuccess;

			if (!dmSuccess) return timeoutResponse.DM_ERROR;

			return timeoutResponse.SUCCESS;
		})();

		if (!([timeoutResponse.ACTION_ERROR, timeoutResponse.MODLOG_ERROR] as const).includes(ret))
			client.emit(
				'bushTimeout',
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

	/**
	 * Removes a timeout from a user.
	 * @param options Options for removing the timeout.
	 */
	public async bushRemoveTimeout(options: BushPunishmentOptions): Promise<RemoveTimeoutResponse> {
		// checks
		if (!this.guild.me!.permissions.has('MODERATE_MEMBERS')) return removeTimeoutResponse.MISSING_PERMISSIONS;

		let caseID: string | undefined = undefined;
		let dmSuccessEvent: boolean | undefined = undefined;
		const moderator = (await util.resolveNonCachedUser(options.moderator ?? this.guild.me))!;

		const ret = await (async () => {
			// remove timeout
			const timeoutSuccess = await this.timeout(null, `${moderator.tag} | ${options.reason ?? 'No reason provided.'}`).catch(
				() => false
			);
			if (!timeoutSuccess) return removeTimeoutResponse.ACTION_ERROR;

			// add modlog entry
			const { log: modlog } = await Moderation.createModLogEntry({
				type: ModLogType.REMOVE_TIMEOUT,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild,
				evidence: options.evidence
			});

			if (!modlog) return removeTimeoutResponse.MODLOG_ERROR;
			caseID = modlog.id;

			// dm user
			const dmSuccess = await this.bushPunishDM('untimedout', options.reason);
			dmSuccessEvent = dmSuccess;

			if (!dmSuccess) return removeTimeoutResponse.DM_ERROR;

			return removeTimeoutResponse.SUCCESS;
		})();

		if (!([removeTimeoutResponse.ACTION_ERROR, removeTimeoutResponse.MODLOG_ERROR] as const).includes(ret))
			client.emit(
				'bushRemoveTimeout',
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

	/**
	 * Whether or not the user is an owner of the bot.
	 */
	public isOwner(): boolean {
		return client.isOwner(this);
	}

	/**
	 * Whether or not the user is a super user of the bot.
	 */
	public isSuperUser(): boolean {
		return client.isSuperUser(this);
	}
}

/**
 * Options for punishing a user.
 */
export interface BushPunishmentOptions {
	/**
	 * The reason for the punishment.
	 */
	reason?: string | null;

	/**
	 * The moderator who punished the user.
	 */
	moderator?: BushGuildMember;

	/**
	 * Evidence for the punishment.
	 */
	evidence?: string;
}

/**
 * Punishment options for punishments that can be temporary.
 */
export interface BushTimedPunishmentOptions extends BushPunishmentOptions {
	/**
	 * The duration of the punishment.
	 */
	duration?: number;
}

/**
 * Options for a role add punishment.
 */
export interface AddRoleOptions extends BushTimedPunishmentOptions {
	/**
	 * The role to add to the user.
	 */
	role: BushRole | Role;

	/**
	 * Whether to create a modlog entry for this punishment.
	 */
	addToModlog: boolean;
}

/**
 * Options for a role remove punishment.
 */
export interface RemoveRoleOptions extends BushTimedPunishmentOptions {
	/**
	 * The role to remove from the user.
	 */
	role: BushRole | Role;

	/**
	 * Whether to create a modlog entry for this punishment.
	 */
	addToModlog: boolean;
}

/**
 * Options for banning a user.
 */
export interface BushBanOptions extends BushTimedPunishmentOptions {
	/**
	 * The number of days to delete the user's messages for.
	 */
	deleteDays?: number;
}

/**
 * Options for blocking a user from a channel.
 */
export interface BlockOptions extends BushTimedPunishmentOptions {
	/**
	 * The channel to block the user from.
	 */
	channel: BushGuildTextChannelResolvable | BushThreadChannelResolvable;
}

/**
 * Options for unblocking a user from a channel.
 */
export interface UnblockOptions extends BushPunishmentOptions {
	/**
	 * The channel to unblock the user from.
	 */
	channel: BushGuildTextChannelResolvable | BushThreadChannelResolvable;
}

/**
 * Punishment options for punishments that can be temporary.
 */
export interface BushTimeoutOptions extends BushPunishmentOptions {
	/**
	 * The duration of the punishment.
	 */
	duration: number;
}

type ValueOf<T> = T[keyof T];

export const basePunishmentResponse = Object.freeze({
	SUCCESS: 'success',
	MODLOG_ERROR: 'error creating modlog entry',
	ACTION_ERROR: 'error performing action'
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
	...punishmentEntryAdd
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

export type PartialBushGuildMember = Partialize<BushGuildMember, 'joinedAt' | 'joinedTimestamp'>;

/**
 * @typedef {BushClientEvents} VSCodePleaseDontRemove
 */
