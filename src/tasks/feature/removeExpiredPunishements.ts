import { ActivePunishment, ActivePunishmentType, BotTask, Time } from '#lib';
import assert from 'node:assert/strict';
import { Op } from 'sequelize';

export default class RemoveExpiredPunishmentsTask extends BotTask {
	public constructor() {
		super('removeExpiredPunishments', {
			delay: 15 * Time.Second,
			runOnStart: true
		});
	}

	public async exec() {
		const expiredEntries = await ActivePunishment.findAll({
			where: {
				expires: {
					[Op.lt]: new Date(Date.now() + 15 * Time.Second) // Find all rows with an expiry date before 15 seconds from now
				}
			}
		});

		void this.client.logger.verbose(
			`removeExpiredPunishments`,
			`Queried punishments, found <<${expiredEntries.length}>> expired punishments.`
		);

		for (const entry of expiredEntries) {
			const guild = this.client.guilds.cache.get(entry.guild);
			if (!guild) continue;

			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			setTimeout(async () => {
				const member = guild.members.cache.get(entry.user);
				const user = await this.client.utils.resolveNonCachedUser(entry.user);
				assert(guild);

				switch (entry.type) {
					case ActivePunishmentType.Ban: {
						assert(user);
						const result = await guild.customUnban({ user: user, reason: 'Punishment expired' });
						if (['success', 'user not banned', 'cannot resolve user'].includes(result)) await entry.destroy();
						else throw new Error(result);
						void this.client.logger.verbose(`removeExpiredPunishments`, `Unbanned ${entry.user}.`);
						break;
					}
					case ActivePunishmentType.Block: {
						if (!member) {
							// channel overrides are removed when the member leaves the guild
							await entry.destroy();
							return;
						}
						const result = await member.customUnblock({ reason: 'Punishment expired', channel: entry.extraInfo });
						if (['success', 'user not blocked'].includes(result)) await entry.destroy();
						else throw new Error(result);
						void this.client.logger.verbose(`removeExpiredPunishments`, `Unblocked ${entry.user}.`);
						break;
					}
					case ActivePunishmentType.Mute: {
						if (!member) {
							const stickyRes = await guild.customStickyUnmute({ user: entry.user, reason: 'Punishment expired' });
							if (['success', 'no sticky', 'no mute in sticky'].includes(stickyRes)) await entry.destroy();
							else throw new Error(stickyRes);
							return;
						}
						const result = await member.customUnmute({ reason: 'Punishment expired' });
						if (['success', 'failed to dm'].includes(result)) await entry.destroy();
						else throw new Error(result);
						void this.client.logger.verbose(`removeExpiredPunishments`, `Unmuted ${entry.user}.`);
						break;
					}
					case ActivePunishmentType.Role: {
						if (!member) return;
						const role = guild?.roles?.cache?.get(entry.extraInfo);
						if (!role) throw new Error(`Cannot unmute ${member.user.tag} because I cannot find the punishment role.`);
						const result = await member.customRemoveRole({
							reason: 'Punishment expired',
							role: role,
							addToModlog: true
						});

						if (['success', 'failed to dm'].includes(result)) await entry.destroy();
						else throw new Error(result);
						void this.client.logger.verbose(`removeExpiredPunishments`, `Removed a punishment role from ${entry.user}.`);
						break;
					}
				}
			}, entry.expires!.getTime() - new Date().getTime());
		}
	}
}
