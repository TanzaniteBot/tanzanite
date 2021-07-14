import { BushGuildMember, BushTask, Mute } from '@lib';
import { Op } from 'sequelize';

export default class UnmuteTask extends BushTask {
	public constructor() {
		super('unmute', {
			delay: 30_000, // 1/2 min
			runOnStart: true
		});
	}
	async exec(): Promise<void> {
		const rows = await Mute.findAll({
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
		this.client.logger.verbose(`UnmuteTask`, `Queried mutes, found <<${rows.length}>> expired mutes.`);
		for (const row of rows) {
			const guild = this.client.guilds.cache.get(row.guild);
			if (!guild) {
				await row.destroy();
				continue;
			}

			const member = guild.members.cache.get(row.user) as BushGuildMember;
			const result = await member.unmute({ reason: 'Punishment expired.' });
			if (['success', 'failed to dm'].includes(result)) await row.destroy();
			else throw result;

			this.client.logger.verbose(`UnmuteTask`, `Unmuted ${row.user}`);
		}
	}
}
