import { BushGuild, BushTask } from '@lib';
import { Op } from 'sequelize';
import { ActivePunishment, ActivePunishmentType } from '../lib/models/ActivePunishment';

export default class RemoveExpiredPunishmentsTask extends BushTask {
	public constructor() {
		super('removeExpiredPunishments', {
			delay: 15_000, // 15 seconds
			runOnStart: true
		});
	}
	public override async exec(): Promise<void> {
		const expiredEntries = await ActivePunishment.findAll({
			where: {
				[Op.and]: [
					{
						expires: {
							[Op.lt]: new Date() // Find all rows with an expiry date before now
						}
					}
				]
			}
		});

		void client.logger.verbose(
			`removeExpiredPunishments`,
			`Queried punishments, found <<${expiredEntries.length}>> expired punishments.`
		);

		for (const entry of expiredEntries) {
			const guild = client.guilds.cache.get(entry.guild) as BushGuild;
			const member = guild.members.cache.get(entry.user);

			if (!guild) {
				await entry.destroy();
				continue;
			}

			switch (entry.type) {
				case ActivePunishmentType.BAN: {
					const result = await guild.unban({ user: entry.user, reason: 'Punishment expired.' });
					if (['success', 'user not banned'].includes(result)) await entry.destroy();
					else throw new Error(result);
					void client.logger.verbose(`removeExpiredPunishments`, `Unbanned ${entry.user}.`);
					break;
				}
				case ActivePunishmentType.BLOCK: {
					//todo
					break;
				}
				case ActivePunishmentType.MUTE: {
					if (!member) continue;
					const result = await member.unmute({ reason: 'Punishment expired.' });
					if (['success', 'failed to dm'].includes(result)) await entry.destroy();
					else throw new Error(result);
					void client.logger.verbose(`removeExpiredPunishments`, `Unmuted ${entry.user}.`);
					break;
				}
				case ActivePunishmentType.ROLE: {
					if (!member) continue;
					const role = guild?.roles?.cache?.get(entry.extraInfo);
					const result = await member.removeRole({
						reason: 'Punishment expired.',
						role: role,
						addToModlog: true
					});

					if (['success', 'failed to dm'].includes(result)) await entry.destroy();
					else throw new Error(result);
					void client.logger.verbose(`removeExpiredPunishments`, `Removed a punishment role from ${entry.user}.`);
					break;
				}
			}
		}
	}
}
