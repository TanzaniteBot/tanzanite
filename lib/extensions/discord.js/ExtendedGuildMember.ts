/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	Action,
	checkMutePermissions,
	createModLogEntry,
	createPunishmentEntry,
	punishDM,
	removePunishmentEntry
} from '#lib/common/Moderation.js';
import { TanzaniteClient } from '#lib/extensions/discord-akairo/TanzaniteClient.js';
import { TanzaniteEvent, Time } from '#lib/utils/Constants.js';
import { formatError, type ValueOf } from '#lib/utils/Utils.js';
import { ModLogType } from '#models';
import {
	ChannelType,
	GuildMember,
	PermissionFlagsBits,
	type GuildChannelResolvable,
	type GuildTextBasedChannel,
	type Role
} from 'discord.js';
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
		punishment: Action,
		reason?: string | null,
		duration?: number,
		modlog?: string,
		sendFooter?: boolean
	): Promise<boolean>;
	/**
	 * Warn the user, create a modlog entry, and send a dm to the user.
	 * @param options Options for warning the user.
	 * @returns An object with the result of the warning, and the case number of the warn.
	 * @emits {@link TanzaniteEvent.Warn}
	 */
	customWarn(options: CustomPunishmentOptions): Promise<{ result: WarnResponse; caseNum: number | null }>;
	/**
	 * Add a role to the user, if it is a punishment create a modlog entry, and create a punishment entry if it is temporary or a punishment.
	 * @param options Options for adding a role to the user.
	 * @returns A status message for adding the add.
	 * @emits {@link TanzaniteEvent.PunishRoleAdd}
	 */
	customAddRole(options: AddRoleOptions): Promise<AddRoleResponse>;
	/**
	 * Remove a role from the user, if it is a punishment create a modlog entry, and destroy a punishment entry if it was temporary or a punishment.
	 * @param options Options for removing a role from the user.
	 * @returns A status message for removing the role.
	 * @emits {@link TanzaniteEvent.PunishRoleRemove}
	 */
	customRemoveRole(options: RemoveRoleOptions): Promise<RemoveRoleResponse>;
	/**
	 * Mute the user, create a modlog entry, creates a punishment entry, and dms the user.
	 * @param options Options for muting the user.
	 * @returns A status message for muting the user.
	 * @emits {@link TanzaniteEvent.Mute}
	 */
	customMute(options: CustomTimedPunishmentOptions): Promise<MuteResponse>;
	/**
	 * Unmute the user, create a modlog entry, remove the punishment entry, and dm the user.
	 * @param options Options for unmuting the user.
	 * @returns A status message for unmuting the user.
	 * @emits {@link TanzaniteEvent.Unmute}
	 */
	customUnmute(options: CustomPunishmentOptions): Promise<UnmuteResponse>;
	/**
	 * Kick the user, create a modlog entry, and dm the user.
	 * @param options Options for kicking the user.
	 * @returns A status message for kicking the user.
	 * @emits {@link TanzaniteEvent.Kick}
	 */
	customKick(options: CustomPunishmentOptions): Promise<KickResponse>;
	/**
	 * Ban the user, create a modlog entry, create a punishment entry, and dm the user.
	 * @param options Options for banning the user.
	 * @returns A status message for banning the user.
	 * @emits {@link TanzaniteEvent.Ban}
	 */
	customBan(options: CustomBanOptions): Promise<Exclude<BanResponse, (typeof banResponse)['AlreadyBanned']>>;
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
		readonly client: TanzaniteClient<true>;
	}
}

export class ExtendedGuildMember extends GuildMember implements Extension {
	/**
	 * Sets the default values for the options.
	 */
	#optionDefaults<T extends CustomPunishmentOptions>(options: T): T {
		options.noDM ??= options.silent ?? false;
		return options;
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
			return shouldAddRoleResponse.UserHierarchy;
		} else if (role.managed) {
			return shouldAddRoleResponse.RoleManaged;
		} else if (this.guild.members.me!.roles.highest.position <= role.position) {
			return shouldAddRoleResponse.ClientHierarchy;
		}
		return true;
	}

	public override async customPunishDM(
		punishment: Action,
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
		options = this.#optionDefaults(options);

		let caseID: string | null = null;
		let dmSuccess: boolean | null = null;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return { result: warnResponse.CannotResolveUser, caseNum: null };

		const ret = await (async (): Promise<{ result: WarnResponse; caseNum: number | null }> => {
			// add modlog entry
			const result = await createModLogEntry(
				{
					client: this.client,
					type: ModLogType.Warn,
					user: this,
					moderator: moderator.id,
					reason: options.reason,
					guild: this.guild,
					evidence: options.evidence,
					hidden: options.silent ?? false
				},
				true
			);

			caseID = result.log?.id ?? null;
			if (!result || !result.log) return { result: warnResponse.ModlogError, caseNum: null };

			if (!options.noDM) {
				// dm user
				dmSuccess = await this.customPunishDM(Action.Warn, options.reason);

				if (dmSuccess === false) return { result: warnResponse.DmError, caseNum: result.caseNum };
			}

			return { result: warnResponse.Success, caseNum: result.caseNum };
		})();
		if (!([warnResponse.ModlogError] as const).includes(ret.result) && !options.silent)
			this.client.emit(TanzaniteEvent.Warn, this, moderator, this.guild, options.reason ?? undefined, caseID!, dmSuccess);
		return ret;
	}

	public override async customAddRole(options: AddRoleOptions): Promise<AddRoleResponse> {
		// checks
		if (!this.guild.members.me!.permissions.has(PermissionFlagsBits.ManageRoles)) return roleResponse.MissingPermissions;
		const ifShouldAddRole = this.#checkIfShouldAddRole(options.role, options.moderator);
		if (ifShouldAddRole !== true) return ifShouldAddRole;

		let caseID: string | null = null;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return roleResponse.CannotResolveUser;

		const ret = await (async () => {
			if (options.addToModlog || options.duration) {
				const { log: modlog } = await createModLogEntry({
					client: this.client,
					type: options.duration ? ModLogType.TempPunishmentRole : ModLogType.PermPunishmentRole,
					guild: this.guild,
					moderator: moderator.id,
					user: this,
					reason: 'N/A',
					pseudo: !options.addToModlog,
					evidence: options.evidence,
					hidden: options.silent ?? false
				});

				if (!modlog) return roleResponse.ModlogError;
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
					if (!punishmentEntrySuccess) return roleResponse.PunishmentEntryError;
				}
			}

			const removeRoleSuccess = await this.roles.add(options.role, `${moderator.tag}`);
			if (!removeRoleSuccess) return roleResponse.ActionError;

			return roleResponse.Success;
		})();
		if (
			!([roleResponse.ActionError, roleResponse.ModlogError, roleResponse.PunishmentEntryError] as const).includes(ret) &&
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
		if (!this.guild.members.me!.permissions.has(PermissionFlagsBits.ManageRoles)) return roleResponse.MissingPermissions;
		const ifShouldAddRole = this.#checkIfShouldAddRole(options.role, options.moderator);
		if (ifShouldAddRole !== true) return ifShouldAddRole;

		let caseID: string | undefined = undefined;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return roleResponse.CannotResolveUser;

		const ret = await (async () => {
			if (options.addToModlog) {
				const { log: modlog } = await createModLogEntry({
					client: this.client,
					type: ModLogType.RemovePunishmentRole,
					guild: this.guild,
					moderator: moderator.id,
					user: this,
					reason: 'N/A',
					evidence: options.evidence,
					hidden: options.silent ?? false
				});

				if (!modlog) return roleResponse.ModlogError;
				caseID = modlog.id;

				const punishmentEntrySuccess = await removePunishmentEntry({
					client: this.client,
					type: 'role',
					user: this,
					guild: this.guild,
					extraInfo: options.role.id
				});

				if (!punishmentEntrySuccess) return roleResponse.PunishmentEntryError;
			}

			const removeRoleSuccess = await this.roles.remove(options.role, `${moderator.tag}`);
			if (!removeRoleSuccess) return roleResponse.ActionError;

			return roleResponse.Success;
		})();

		const nonSuccess = (
			[roleResponse.ActionError, roleResponse.ModlogError, roleResponse.PunishmentEntryError] as const
		).includes(ret);

		if (!nonSuccess && options.addToModlog && !options.silent) {
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
		}
		return ret;
	}

	public override async customMute(options: CustomTimedPunishmentOptions): Promise<MuteResponse> {
		options = this.#optionDefaults(options);

		// checks
		const checks = await checkMutePermissions(this.guild);
		if (checks !== true) return checks;

		const muteRoleID = (await this.guild.getSetting('muteRole'))!;
		const muteRole = this.guild.roles.cache.get(muteRoleID)!;

		let caseID: string | null = null;
		let dmSuccess: boolean | null = null;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return muteResponse.CannotResolveUser;

		const ret = await (async () => {
			// add role
			const muteSuccess = await this.roles
				.add(muteRole, `[Mute] ${moderator.tag} | ${options.reason ?? 'No reason provided.'}`)
				.catch(async (e) => {
					await this.client.console.warn('muteRoleAddError', e);
					this.client.console.debug(e);
					return false;
				});
			if (!muteSuccess) return muteResponse.ActionError;

			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: options.duration ? ModLogType.TempMute : ModLogType.PermMute,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				duration: options.duration,
				guild: this.guild,
				evidence: options.evidence,
				hidden: options.silent ?? false
			});

			if (!modlog) return muteResponse.ModlogError;
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

			if (!punishmentEntrySuccess) return muteResponse.PunishmentEntryError;

			if (!options.noDM) {
				// dm user
				dmSuccess = await this.customPunishDM(Action.Mute, options.reason, options.duration ?? 0, modlog.id);

				if (dmSuccess === false) return muteResponse.DmError;
			}

			return muteResponse.Success;
		})();

		if (
			!([muteResponse.ActionError, muteResponse.ModlogError, muteResponse.PunishmentEntryError] as const).includes(ret) &&
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
				dmSuccess,
				options.evidence
			);
		return ret;
	}

	public override async customUnmute(options: CustomPunishmentOptions): Promise<UnmuteResponse> {
		options = this.#optionDefaults(options);

		// checks
		const checks = await checkMutePermissions(this.guild);
		if (checks !== true) return checks;

		const muteRoleID = (await this.guild.getSetting('muteRole'))!;
		const muteRole = this.guild.roles.cache.get(muteRoleID)!;

		let caseID: string | null = null;
		let dmSuccess: boolean | null = null;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return unmuteResponse.CannotResolveUser;

		const ret = await (async () => {
			// remove role
			const muteSuccess = await this.roles
				.remove(muteRole, `[Unmute] ${moderator.tag} | ${options.reason ?? 'No reason provided.'}`)
				.catch(async (e) => {
					await this.client.console.warn('muteRoleAddError', formatError(e, true));
					return false;
				});
			if (!muteSuccess) return unmuteResponse.ActionError;

			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: ModLogType.Unmute,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild,
				evidence: options.evidence,
				hidden: options.silent ?? false
			});

			if (!modlog) return unmuteResponse.ModlogError;
			caseID = modlog.id;

			// remove mute entry
			const removePunishmentEntrySuccess = await removePunishmentEntry({
				client: this.client,
				type: 'mute',
				user: this,
				guild: this.guild
			});

			if (!removePunishmentEntrySuccess) return unmuteResponse.PunishmentEntryError;

			if (!options.noDM) {
				// dm user
				dmSuccess = await this.customPunishDM(Action.Unmute, options.reason, undefined, '', false);

				if (dmSuccess === false) return unmuteResponse.DmError;
			}

			return unmuteResponse.Success;
		})();

		if (
			!([unmuteResponse.ActionError, unmuteResponse.ModlogError, unmuteResponse.PunishmentEntryError] as const).includes(ret) &&
			!options.silent
		)
			this.client.emit(
				TanzaniteEvent.Unmute,
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				dmSuccess,
				options.evidence
			);
		return ret;
	}

	public override async customKick(options: CustomPunishmentOptions): Promise<KickResponse> {
		options = this.#optionDefaults(options);

		// checks
		if (!this.guild.members.me?.permissions.has(PermissionFlagsBits.KickMembers) || !this.kickable)
			return kickResponse.MissingPermissions;

		let caseID: string | null = null;
		let dmSuccess: boolean | null = null;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return kickResponse.CannotResolveUser;
		const ret = await (async () => {
			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: ModLogType.Kick,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild,
				evidence: options.evidence,
				hidden: options.silent ?? false
			});
			if (!modlog) return kickResponse.ModlogError;
			caseID = modlog.id;

			// dm user
			if (!options.noDM) {
				dmSuccess = await this.customPunishDM(Action.Kick, options.reason, undefined, modlog.id);
			}

			// kick
			const kickSuccess = await this.kick(`${moderator?.tag} | ${options.reason ?? 'No reason provided.'}`).catch(() => false);

			if (!kickSuccess) return kickResponse.ActionError;

			if (!options.noDM && dmSuccess === false) {
				return kickResponse.DmError;
			}

			return kickResponse.Success;
		})();
		if (!([kickResponse.ActionError, kickResponse.ModlogError] as const).includes(ret) && !options.silent)
			this.client.emit(
				TanzaniteEvent.Kick,
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				dmSuccess,
				options.evidence
			);
		return ret;
	}

	public override async customBan(
		options: CustomBanOptions
	): Promise<Exclude<BanResponse, (typeof banResponse)['AlreadyBanned']>> {
		options = this.#optionDefaults(options);

		// checks
		if (!this.guild.members.me!.permissions.has(PermissionFlagsBits.BanMembers) || !this.bannable)
			return banResponse.MissingPermissions;

		let caseID: string | null = null;
		let dmSuccess: boolean | null = null;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return banResponse.CannotResolveUser;

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
				type: options.duration ? ModLogType.TempBan : ModLogType.PermBan,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				duration: options.duration,
				guild: this.guild,
				evidence: options.evidence,
				hidden: options.silent ?? false
			});
			if (!modlog) return banResponse.ModlogError;
			caseID = modlog.id;

			if (!options.noDM) {
				// dm user
				dmSuccess = await this.customPunishDM(Action.Ban, options.reason, options.duration ?? 0, modlog.id);
			}

			// ban
			const banSuccess = await this.ban({
				reason: `${moderator.tag} | ${options.reason ?? 'No reason provided.'}`,
				deleteMessageSeconds: options.deleteMessageSeconds
			}).catch(() => false);
			if (!banSuccess) return banResponse.ActionError;

			// add punishment entry so they can be unbanned later
			const punishmentEntrySuccess = await createPunishmentEntry({
				client: this.client,
				type: 'ban',
				user: this,
				guild: this.guild,
				duration: options.duration,
				modlog: modlog.id
			});
			if (!punishmentEntrySuccess) return banResponse.PunishmentEntryError;

			if (!options.noDM && dmSuccess === false) {
				return banResponse.DmError;
			}

			return banResponse.Success;
		})();
		if (
			!([banResponse.ActionError, banResponse.ModlogError, banResponse.PunishmentEntryError] as const).includes(ret) &&
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
				dmSuccess,
				options.evidence
			);
		return ret;
	}

	public override async customBlock(options: BlockOptions): Promise<BlockResponse> {
		options = this.#optionDefaults(options);

		const channel = this.guild.channels.resolve(options.channel);
		if (!channel || (!channel.isTextBased() && !channel.isThread())) return blockResponse.InvalidChannel;

		// checks
		if (!channel.permissionsFor(this.guild.members.me!)!.has(PermissionFlagsBits.ManageChannels))
			return blockResponse.MissingPermissions;

		let caseID: string | null = null;
		let dmSuccess: boolean | null = null;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return blockResponse.CannotResolveUser;

		const ret = await (async () => {
			// change channel permissions
			const channelToUse = channel.isThread() ? channel.parent! : channel;
			const perm = channel.isThread() ? { SendMessagesInThreads: false } : { SendMessages: false };
			const blockSuccess = await channelToUse.permissionOverwrites
				.edit(this, perm, { reason: `[Block] ${moderator.tag} | ${options.reason ?? 'No reason provided.'}` })
				.catch(() => false);
			if (!blockSuccess) return blockResponse.ActionError;

			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: options.duration ? ModLogType.TempChannelBlock : ModLogType.PermChannelBlock,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild,
				evidence: options.evidence,
				hidden: options.silent ?? false
			});
			if (!modlog) return blockResponse.ModlogError;
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
			if (!punishmentEntrySuccess) return blockResponse.PunishmentEntryError;

			if (!options.noDM) {
				// dm user
				dmSuccess = await punishDM({
					client: this.client,
					punishment: Action.Block,
					reason: options.reason ?? undefined,
					duration: options.duration ?? 0,
					modlog: modlog.id,
					guild: this.guild,
					user: this,
					sendFooter: true,
					channel: channel.id
				});
				if (dmSuccess === false) return blockResponse.DmError;
			}

			return blockResponse.Success;
		})();

		if (
			!([blockResponse.ActionError, blockResponse.ModlogError, blockResponse.PunishmentEntryError] as const).includes(ret) &&
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
				dmSuccess,
				channel,
				options.evidence
			);
		return ret;
	}

	public override async customUnblock(options: UnblockOptions): Promise<UnblockResponse> {
		options = this.#optionDefaults(options);

		const _channel = this.guild.channels.resolve(options.channel);
		if (!_channel || (_channel.type !== ChannelType.GuildText && !_channel.isThread())) return unblockResponse.InvalidChannel;
		const channel = _channel as GuildTextBasedChannel;

		// checks
		if (!channel.permissionsFor(this.guild.members.me!)!.has(PermissionFlagsBits.ManageChannels))
			return unblockResponse.MissingPermissions;

		let caseID: string | null = null;
		let dmSuccess: boolean | null = null;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return unblockResponse.CannotResolveUser;

		const ret = await (async () => {
			// change channel permissions
			const channelToUse = channel.isThread() ? channel.parent! : channel;
			const perm = channel.isThread() ? { SendMessagesInThreads: null } : { SendMessages: null };
			const blockSuccess = await channelToUse.permissionOverwrites
				.edit(this, perm, { reason: `[Unblock] ${moderator.tag} | ${options.reason ?? 'No reason provided.'}` })
				.catch(() => false);
			if (!blockSuccess) return unblockResponse.ActionError;

			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: ModLogType.ChannelUnblock,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild,
				evidence: options.evidence,
				hidden: options.silent ?? false
			});
			if (!modlog) return unblockResponse.ModlogError;
			caseID = modlog.id;

			// remove punishment entry
			const punishmentEntrySuccess = await removePunishmentEntry({
				client: this.client,
				type: 'block',
				user: this,
				guild: this.guild,
				extraInfo: channel.id
			});
			if (!punishmentEntrySuccess) return unblockResponse.ActionError;

			if (!options.noDM) {
				// dm user
				dmSuccess = await punishDM({
					client: this.client,
					punishment: Action.Unblock,
					reason: options.reason ?? undefined,
					guild: this.guild,
					user: this,
					sendFooter: false,
					channel: channel.id
				});

				if (dmSuccess === false) return unblockResponse.DmError;
			}

			return unblockResponse.Success;
		})();

		if (
			!([unblockResponse.ActionError, unblockResponse.ModlogError, unblockResponse.ActionError] as const).includes(ret) &&
			!options.silent
		)
			this.client.emit(
				TanzaniteEvent.Unblock,
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				dmSuccess,
				channel,
				options.evidence
			);
		return ret;
	}

	public override async customTimeout(options: CustomTimeoutOptions): Promise<TimeoutResponse> {
		options = this.#optionDefaults(options);

		// checks
		if (!this.guild.members.me!.permissions.has(PermissionFlagsBits.ModerateMembers)) return timeoutResponse.MissingPermissions;

		const twentyEightDays = Time.Day * 28;
		if (options.duration > twentyEightDays) return timeoutResponse.InvalidDuration;

		let caseID: string | null = null;
		let dmSuccess: boolean | null = null;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return timeoutResponse.CannotResolveUser;

		const ret = await (async () => {
			// timeout
			const timeoutSuccess = await this.timeout(
				options.duration,
				`${moderator.tag} | ${options.reason ?? 'No reason provided.'}`
			).catch(() => false);
			if (!timeoutSuccess) return timeoutResponse.ActionError;

			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: ModLogType.Timeout,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				duration: options.duration,
				guild: this.guild,
				evidence: options.evidence,
				hidden: options.silent ?? false
			});

			if (!modlog) return timeoutResponse.ModlogError;
			caseID = modlog.id;

			if (!options.noDM) {
				// dm user
				dmSuccess = await this.customPunishDM(Action.Timeout, options.reason, options.duration, modlog.id);

				if (dmSuccess === false) return timeoutResponse.DmError;
			}

			return timeoutResponse.Success;
		})();

		if (!([timeoutResponse.ActionError, timeoutResponse.ModlogError] as const).includes(ret) && !options.silent)
			this.client.emit(
				TanzaniteEvent.Timeout,
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				options.duration ?? 0,
				dmSuccess,
				options.evidence
			);
		return ret;
	}

	public override async customRemoveTimeout(options: CustomPunishmentOptions): Promise<RemoveTimeoutResponse> {
		options = this.#optionDefaults(options);

		// checks
		if (!this.guild.members.me!.permissions.has(PermissionFlagsBits.ModerateMembers))
			return removeTimeoutResponse.MissingPermissions;

		let caseID: string | null = null;
		let dmSuccess: boolean | null = null;
		const moderator = await this.client.utils.resolveNonCachedUser(options.moderator ?? this.guild.members.me);
		if (!moderator) return removeTimeoutResponse.CannotResolveUser;

		const ret = await (async () => {
			// remove timeout
			const timeoutSuccess = await this.timeout(null, `${moderator.tag} | ${options.reason ?? 'No reason provided.'}`).catch(
				() => false
			);
			if (!timeoutSuccess) return removeTimeoutResponse.ActionError;

			// add modlog entry
			const { log: modlog } = await createModLogEntry({
				client: this.client,
				type: ModLogType.RemoveTimeout,
				user: this,
				moderator: moderator.id,
				reason: options.reason,
				guild: this.guild,
				evidence: options.evidence,
				hidden: options.silent ?? false
			});

			if (!modlog) return removeTimeoutResponse.ModlogError;
			caseID = modlog.id;

			if (!options.noDM) {
				// dm user
				dmSuccess = await this.customPunishDM(Action.Untimeout, options.reason, undefined, '', false);

				if (dmSuccess === false) return removeTimeoutResponse.DmError;
			}

			return removeTimeoutResponse.Success;
		})();

		if (!([removeTimeoutResponse.ActionError, removeTimeoutResponse.ModlogError] as const).includes(ret) && !options.silent)
			this.client.emit(
				TanzaniteEvent.RemoveTimeout,
				this,
				moderator,
				this.guild,
				options.reason ?? undefined,
				caseID!,
				dmSuccess,
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

	/**
	 * Don't send a dm to the user.
	 * @default silent
	 */
	noDM?: boolean;
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
export interface AddRoleOptions extends Omit<CustomTimedPunishmentOptions, 'noDM'> {
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
export interface RemoveRoleOptions extends Omit<CustomTimedPunishmentOptions, 'noDM'> {
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
	deleteMessageSeconds?: number;
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
	Success: 'success',
	ModlogError: 'error creating modlog entry',
	ActionError: 'error performing action',
	CannotResolveUser: 'cannot resolve user'
} as const);

export const dmResponse = Object.freeze({
	...basePunishmentResponse,
	DmError: 'failed to dm'
} as const);

export const permissionsResponse = Object.freeze({
	MissingPermissions: 'missing permissions'
} as const);

export const punishmentEntryError = Object.freeze({
	PunishmentEntryError: 'punishment entry error'
} as const);

export const shouldAddRoleResponse = Object.freeze({
	UserHierarchy: 'user hierarchy',
	ClientHierarchy: 'client hierarchy',
	RoleManaged: 'role managed'
} as const);

export const baseBlockResponse = Object.freeze({
	InvalidChannel: 'invalid channel'
} as const);

export const baseMuteResponse = Object.freeze({
	NoMuteRole: 'no mute role',
	MuteRoleInvalid: 'invalid mute role',
	MuteRoleNotManageable: 'mute role not manageable'
} as const);

export const warnResponse = Object.freeze({
	...dmResponse
} as const);

export const roleResponse = Object.freeze({
	...basePunishmentResponse,
	...permissionsResponse,
	...shouldAddRoleResponse,
	...punishmentEntryError
} as const);

export const muteResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse,
	...baseMuteResponse,
	...punishmentEntryError
} as const);

export const unmuteResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse,
	...baseMuteResponse,
	...punishmentEntryError
} as const);

export const kickResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse
} as const);

export const banResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse,
	...punishmentEntryError,
	AlreadyBanned: 'already banned'
} as const);

export const blockResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse,
	...baseBlockResponse,
	...punishmentEntryError
});

export const unblockResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse,
	...baseBlockResponse,
	...punishmentEntryError
});

export const timeoutResponse = Object.freeze({
	...dmResponse,
	...permissionsResponse,
	InvalidDuration: 'duration too long'
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
export type AddRoleResponse = ValueOf<typeof roleResponse>;

/**
 * Response returned when removing a role from a user.
 */
export type RemoveRoleResponse = ValueOf<typeof roleResponse>;

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
