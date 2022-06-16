import { ActivePunishment, ActivePunishmentType, BushTask, resolveNonCachedUser, Time } from '#lib';
import assert from 'assert';
const { Op } = (await import('sequelize')).default;

export default class RemoveExpiredPunishmentsTask extends BushTask {
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

		void client.logger.verbose(
			`removeExpiredPunishments`,
			`Queried punishments, found <<${expiredEntries.length}>> expired punishments.`
		);

		for (const entry of expiredEntries) {
			const guild = client.guilds.cache.get(entry.guild);
			if (!guild) continue;

			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			setTimeout(async () => {
				const member = guild.members.cache.get(entry.user);
				const user = await resolveNonCachedUser(entry.user);
				assert(guild);

				switch (entry.type) {
					case ActivePunishmentType.BAN: {
						assert(user);
						const result = await guild.bushUnban({ user: user, reason: 'Punishment expired' });
						if (['success', 'user not banned', 'cannot resolve user'].includes(result)) await entry.destroy();
						else throw new Error(result);
						void client.logger.verbose(`removeExpiredPunishments`, `Unbanned ${entry.user}.`);
						break;
					}
					case ActivePunishmentType.BLOCK: {
						if (!member) {
							await entry.destroy(); // channel overrides are removed when the member leaves the guild
							return;
						}
						const result = await member.bushUnblock({ reason: 'Punishment expired', channel: entry.extraInfo });
						if (['success', 'user not blocked'].includes(result)) await entry.destroy();
						else throw new Error(result);
						void client.logger.verbose(`removeExpiredPunishments`, `Unblocked ${entry.user}.`);
						break;
					}
					case ActivePunishmentType.MUTE: {
						if (!member) return;
						const result = await member.bushUnmute({ reason: 'Punishment expired' });
						if (['success', 'failed to dm'].includes(result)) await entry.destroy();
						else throw new Error(result);
						void client.logger.verbose(`removeExpiredPunishments`, `Unmuted ${entry.user}.`);
						break;
					}
					case ActivePunishmentType.ROLE: {
						if (!member) return;
						const role = guild?.roles?.cache?.get(entry.extraInfo);
						if (!role) throw new Error(`Cannot unmute ${member.user.tag} because I cannot find the mute role.`);
						const result = await member.bushRemoveRole({
							reason: 'Punishment expired',
							role: role,
							addToModlog: true
						});

						if (['success', 'failed to dm'].includes(result)) await entry.destroy();
						else throw new Error(result);
						void client.logger.verbose(`removeExpiredPunishments`, `Removed a punishment role from ${entry.user}.`);
						break;
					}
				}
			}, entry.expires!.getTime() - new Date().getTime());
		}
	}
}
