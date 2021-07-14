import { BushGuild, BushTask } from '@lib';

export default class UnbanTask extends BushTask {
	public constructor() {
		super('unban', {
			delay: 30_000, // 1/2 min
			runOnStart: true
		});
	}
	async exec(): Promise<void> {
		const rows = await this.client.util.findExpiredEntries('mute');
		this.client.logger.verbose(`UnbanTask`, `Queried bans, found <<${rows.length}>> expired bans.`);

		for (const row of rows) {
			const guild = this.client.guilds.cache.get(row.guild) as BushGuild;
			if (!guild) {
				await row.destroy();
				continue;
			}

			const result = await guild.unban({ user: row.user, reason: 'Punishment expired.' });
			if (['success', 'user not banned'].includes(result)) await row.destroy();
			else throw result;
			this.client.logger.verbose(`UnbanTask`, `Unbanned ${row.user}`);
		}
	}
}
